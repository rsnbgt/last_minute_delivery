require('dotenv').config();
const db = require('./config/db');

async function testPersistence() {
    try {
        const testEmail = 'persistence_test_' + Date.now() + '@example.com';
        const testMobile = '999' + Math.floor(Math.random() * 10000000);

        console.log(`[TEST] Attempting to insert agent with email: ${testEmail}`);

        // Insert
        await db.execute(
            'INSERT INTO agents (name, email, mobile, password_hash) VALUES (?, ?, ?, ?)',
            ['Persistence Tester', testEmail, testMobile, 'hash']
        );
        console.log('[TEST] Insert successful.');

        // Verify immediately
        const [rows] = await db.execute('SELECT * FROM agents WHERE email = ?', [testEmail]);
        if (rows.length > 0) {
            console.log('[TEST] Immediate verification successful. Record found.');
        } else {
            console.error('[TEST] Immediate verification FAILED. Record NOT found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('[TEST] Error:', err);
        process.exit(1);
    }
}

testPersistence();
