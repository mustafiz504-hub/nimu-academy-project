const studentsTable = `
  CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) DEFAULT '',
    phone VARCHAR(15) DEFAULT '',
    course_name VARCHAR(200) DEFAULT '',
    approved BOOLEAN DEFAULT false,
    completed BOOLEAN DEFAULT false,
    completion_date VARCHAR(50) DEFAULT '',
    certificate_id VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

module.exports = studentsTable;
