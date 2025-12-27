const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { name, email, mobile, password } = req.body;

    if (!name || (!email && !mobile) || !password) {
        return res.status(400).json({ message: 'Name, Password, and Email OR Mobile are required.' });
    }

    try {
        // Check if user exists
        const [existing] = await db.execute(
            'SELECT id FROM agents WHERE email = ? OR mobile = ?',
            [email || null, mobile || null]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Agent with this Email or Mobile already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert
        const [result] = await db.execute(
            'INSERT INTO agents (name, email, mobile, password_hash) VALUES (?, ?, ?, ?)',
            [name, email || null, mobile || null, passwordHash]
        );

        res.status(201).json({
            message: 'Agent registered successfully.',
            agent: {
                id: result.insertId,
                name,
                email,
                mobile
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or mobile

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Email/Mobile and Password are required.' });
    }

    try {
        // Find agent
        const [rows] = await db.execute(
            'SELECT * FROM agents WHERE email = ? OR mobile = ?',
            [identifier, identifier]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const agent = rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, agent.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        res.status(200).json({
            message: 'Login successful.',
            agent: {
                id: agent.id,
                name: agent.name,
                email: agent.email,
                mobile: agent.mobile
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
