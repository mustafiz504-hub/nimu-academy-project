const enrollmentsTable = `
  CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    customer_name VARCHAR(100),
    phone VARCHAR(15),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

module.exports = enrollmentsTable;
