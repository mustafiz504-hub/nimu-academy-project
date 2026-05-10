const pool = require('../config/db');

// GET /api/orders - Get all orders (admin/superadmin)
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, p.name AS product_name, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.status(200).json({ orders: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, p.name AS product_name, u.name AS user_name FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ order: result.rows[0] });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/orders - Place new order (user)
const createOrder = async (req, res) => {
  try {
    const {
      product_id, customer_name, phone, address,
      flavor, size, custom_message, delivery_date,
      special_instructions, total_price
    } = req.body;

    if (!customer_name || !phone || !address || !delivery_date) {
      return res.status(400).json({ message: 'Customer name, phone, address, and delivery date are required.' });
    }

    const result = await pool.query(
      `INSERT INTO orders 
        (user_id, product_id, customer_name, phone, address, flavor, size, custom_message, delivery_date, special_instructions, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.user?.id || null, product_id || null, customer_name, phone, address,
        flavor || null, size || null, custom_message || null, delivery_date,
        special_instructions || null, total_price || null
      ]
    );

    if (req.user?.id) {
      await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Placed order #${result.rows[0].id}`]);
    }

    res.status(201).json({ message: 'Order placed successfully.', order: result.rows[0] });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/orders/:id/status - Update order status (admin/superadmin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Updated order #${req.params.id} to ${status}`]);

    res.status(200).json({ message: 'Order status updated.', order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/orders/:id (admin/superadmin)
const deleteOrder = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [req.user.id, `Deleted order #${req.params.id}`]);
    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder };
