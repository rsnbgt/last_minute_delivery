CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id VARCHAR(255) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) DEFAULT 'roshan.ug22@nsut.ac.in',
    otp_code VARCHAR(10) NOT NULL,
    otp_expires_at DATETIME NULL,
    status ENUM('Pending', 'In-Transit', 'Delivered') DEFAULT 'Pending',
    delivered_at TIMESTAMP NULL,
    delivered_by VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    mobile VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for testing
-- OTPs set to expire 1 hour in the FUTURE relative to NOW() usually, but for static init files we pick a far future date usually,
-- OR we use relative date if running via script. For raw SQL dumping, hardcoded future dates are safest for 'valid' ones.
-- Let's set some to 2026 (valid) and some to 2024 (expired).

INSERT IGNORE INTO shipments (shipment_id, customer_name, otp_code, otp_expires_at, status) VALUES 
('SHP-1001', 'Aman', '1234', DATE_ADD(NOW(), INTERVAL 1 HOUR), 'Pending'), -- Valid (Expires in 1 hr)
('SHP-1002', 'Bose', '5678', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'Pending'),     -- Expired (Expired 1 hr ago)
('SHP-1003', 'Salmaan', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1004', 'Akshay', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1005', 'Pranjal', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1006', 'Dhruv', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1007', 'Anurag', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1008', 'Amaan', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1009', 'Abhinav', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1010', 'Manas', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'),
('SHP-1011', 'Mannu', '9012', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'Pending'); -- Wrapped up
