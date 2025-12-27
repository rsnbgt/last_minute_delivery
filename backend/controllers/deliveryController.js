const db = require('../config/db');
const nodemailer = require('nodemailer');

// Configure Nodemailer (Using Ethereal or Gmail placeholder)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'sandbox.smtp.mailtrap.io' for testing safely
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

exports.requestOTP = async (req, res) => {
    const { shipment_id } = req.body;

    if (!shipment_id) {
        return res.status(400).json({ message: 'Shipment ID is required.' });
    }

    try {
        // 1. Check if shipment exists
        const [rows] = await db.execute(
            'SELECT * FROM shipments WHERE shipment_id = ?',
            [shipment_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found.' });
        }

        const shipment = rows[0];

        // 2. Generate Random 4-digit OTP
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // 3. Set Expiry to 2 Minutes from NOW
        const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        // 4. Update Database
        await db.execute(
            'UPDATE shipments SET otp_code = ?, otp_expires_at = ? WHERE id = ?',
            [newOtp, expiryTime, shipment.id]
        );

        // 5. Send Email
        const email = shipment.customer_email || 'roshan.ug22@nsut.ac.in';
        console.log(`[SIMULATION] Generating OTP for ${shipment_id}: ${newOtp} (Expires: ${expiryTime}) -> Sending to ${email}`);

        // Debug Log
        console.log("Email Config Check:", {
            hasUser: !!process.env.EMAIL_USER,
            hasPass: !!process.env.EMAIL_PASS
        });

        // Only attempt to send if credentials are present to avoid crash, otherwise just log
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const info = await transporter.sendMail({
                    from: '"Reliable Delivery" <no-reply@delivery.com>',
                    to: email,
                    subject: `Your Delivery OTP: ${newOtp}`,
                    text: `Your OTP for shipment ${shipment_id} is ${newOtp}. It expires in 2 minutes.`,
                    html: `<h3>Delivery Verification</h3><p>Your OTP for shipment <b>${shipment_id}</b> is <h1>${newOtp}</h1></p><p>It expires in 2 minutes.</p>`
                });
                console.log(`[EMAIL] Sent successfully: ${info.messageId}`);
            } catch (mailError) {
                console.error(`[EMAIL] FAILED to send:`, mailError);
            }
        } else {
            console.log(`[EMAIL] Skipped sending (No credentials in .env). Check console for OTP.`);
        }

        res.status(200).json({
            message: 'OTP generated and sent to customer email.',
            otp_expiry: expiryTime
        });

    } catch (error) {
        console.error('Error requesting OTP:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.confirmDelivery = async (req, res) => {
    // ... existing confirmDelivery logic ...
    const { shipment_id, otp_code, user_name } = req.body;

    // input validation
    // Basic validation
    if (!shipment_id || !otp_code || !user_name) {
        return res.status(400).json({ message: 'Shipment ID, OTP, and User Name are required.' });
    }

    try {
        // 1. Verify Shipment and OTP
        const [rows] = await db.execute(
            'SELECT * FROM shipments WHERE shipment_id = ?',
            [shipment_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found.' });
        }

        const shipment = rows[0];

        // 2. Check if already delivered
        if (shipment.status === 'Delivered') {
            return res.status(409).json({ message: 'Shipment already delivered.' }); // 409 Conflict
        }

        // 3. Validate OTP
        if (shipment.otp_code !== otp_code) {
            console.warn(`Failed delivery attempt for ${shipment_id}: Invalid OTP.`);
            return res.status(401).json({ message: 'Invalid OTP.' });
        }

        // 3.5 Check OTP Expiry
        const now = new Date();
        const expiry = new Date(shipment.otp_expires_at);
        // Only check if expiry is set (handle legacy rows if any, though init.sql sets them)
        if (shipment.otp_expires_at && now > expiry) {
            console.warn(`Failed delivery attempt for ${shipment_id}: OTP Expired.`);
            return res.status(410).json({ message: 'OTP Expired.' });
        }

        // 4. Update Status
        await db.execute(
            'UPDATE shipments SET status = ?, delivered_at = NOW(), delivered_by = ? WHERE id = ?',
            ['Delivered', user_name, shipment.id]
        );

        console.log(`Shipment ${shipment_id} verified and delivered by ${user_name}.`);

        res.status(200).json({
            message: 'Delivery confirmed successfully.',
            shipment_id: shipment_id,
            status: 'Delivered',
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getDeliveryHistory = async (req, res) => {
    const { agentId } = req.params;

    if (!agentId) {
        return res.status(400).json({ message: 'Agent ID is required.' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT shipment_id, delivered_at, status FROM shipments WHERE delivered_by = ? ORDER BY delivered_at DESC',
            [agentId]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
