const usersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    phone VARCHAR(20),
    country_code VARCHAR(10) DEFAULT '+91',
    phone_number VARCHAR(20) UNIQUE,
    role VARCHAR(20) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    marketing_opt_in BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(255),
    otp_expires_at TIMESTAMP,
    otp_attempts INT DEFAULT 0,
    otp_resend_count INT DEFAULT 0,
    last_otp_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

module.exports = usersTable;
