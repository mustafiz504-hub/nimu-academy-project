const pool = require('../config/db');

// GET /api/gallery - Public
const getGalleryImages = async (req, res) => {
  try {
    const { section } = req.query;
    let query = 'SELECT * FROM gallery_images';
    let params = [];

    if (section) {
      query += ' WHERE section = $1';
      params.push(section);
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.status(200).json({ images: result.rows });
  } catch (error) {
    console.error('Get gallery images error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/gallery (admin/superadmin)
const addGalleryImage = async (req, res) => {
  try {
    const { image_url, public_id, title, section } = req.body;

    if (!image_url || !public_id) {
      return res.status(400).json({ message: 'Image URL and public ID are required.' });
    }

    const result = await pool.query(
      'INSERT INTO gallery_images (image_url, public_id, title, section) VALUES ($1, $2, $3, $4) RETURNING *',
      [image_url, public_id, title || null, section || 'academy']
    );

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Added gallery image: ${title || 'Untitled'}`]);

    res.status(201).json({ message: 'Image added to gallery successfully.', image: result.rows[0] });
  } catch (error) {
    console.error('Add gallery image error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/gallery/:id (admin/superadmin)
const deleteGalleryImage = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gallery_images WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Deleted gallery image #${req.params.id}`]);
    
    res.status(200).json({ message: 'Image deleted from gallery successfully.' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getGalleryImages, addGalleryImage, deleteGalleryImage };
