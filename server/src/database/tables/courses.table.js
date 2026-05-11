const coursesTable = `
  CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    timing VARCHAR(100),
    mode VARCHAR(20),
    price DECIMAL(10,2),
    topics TEXT[],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

module.exports = coursesTable;
