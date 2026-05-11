const pool = require('../config/db');

// GET /api/products - Public
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE available = true ORDER BY created_at ASC');
    res.status(200).json({ products: result.rows });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/products/:id - Public
const getProductById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/products (admin/superadmin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image_url } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required.' });
    }

    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description || null, price, category || null, image_url || null]
    );

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Created product: ${name}`]);

    res.status(201).json({ message: 'Product created successfully.', product: result.rows[0] });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/products/:id (admin/superadmin)
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, available, image_url } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        available = COALESCE($5, available),
        image_url = COALESCE($6, image_url)
       WHERE id = $7 RETURNING *`,
      [name, description, price, category, available, image_url, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Updated product #${req.params.id}`]);

    res.status(200).json({ message: 'Product updated successfully.', product: result.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/products/:id (superadmin only)
const deleteProduct = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Deleted product #${req.params.id}`]);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
