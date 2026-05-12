const galleryTable = `
  CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    section VARCHAR(50) DEFAULT 'academy',
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

module.exports = galleryTable;
