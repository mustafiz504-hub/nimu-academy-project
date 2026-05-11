const ordersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    customer_name VARCHAR(100),
    phone VARCHAR(15),
    address TEXT,
    flavor VARCHAR(50),
    size VARCHAR(20),
    custom_message TEXT,
    delivery_date DATE,
    special_instructions TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

module.exports = ordersTable;
