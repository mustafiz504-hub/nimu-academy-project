// @ts-check
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/** @typedef {import('express').Request & { user?: any }} Request */
/** @typedef {import('express').Response} Response */

// Register
/**
 * @param {Request} req
 * @param {Response} res
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if this is the superadmin email
    let role = 'user';
    if (email === process.env.SUPERADMIN_EMAIL) {
      role = 'superadmin';
    }

    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, phone || null, role]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log activity
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [user.id, 'User registered']);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login
/**
 * @param {Request} req
 * @param {Response} res
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Auto-promote superadmin email
    let role = user.role;
    if (email === process.env.SUPERADMIN_EMAIL && role !== 'superadmin') {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['superadmin', user.id]);
      role = 'superadmin';
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log activity
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [user.id, 'User logged in']);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Logout (stateless - client discards token)
/**
 * @param {Request} req
 * @param {Response} res
 */
const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
};

// Get current user info (me)
/**
 * @param {Request} req
 * @param {Response} res
 */
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, logout, getMe };
