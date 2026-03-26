const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  const allowedRoles = ['admin', 'buyer', 'supplier', 'custom'];
  const assignedRole = allowedRoles.includes(role) ? role : 'buyer';

  try {
    // 1. Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // 2. Hash password  ← THIS WAS MISSING
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 4. Save user with is_verified = FALSE
    const result = await pool.query(
      `INSERT INTO users
         (name, email, password, role, is_verified, verification_token, token_expires_at)
       VALUES ($1, $2, $3, $4, FALSE, $5, $6)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, assignedRole, token, expires]
    );

    // 5. Send verification email
    await sendVerificationEmail(email, name, token);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
 if (!user.is_verified) {
    return res.status(403).json({
      error: 'Please verify your email before logging in. Check your inbox.'
    });
  }
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — get current logged-in user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users — admin only: list all users
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id/role — admin only: change a user's role
router.put('/users/:id/role', verifyToken, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ['admin', 'buyer', 'supplier', 'custom'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'Role updated.', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/roles — get all roles and their permissions
router.get('/roles', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/auth/verify-email?token=abc123...
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  // 1. Find user with this token
  const result = await pool.query(
    `SELECT * FROM users
     WHERE verification_token = $1
     AND token_expires_at > NOW()`,   // check not expired
    [token]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({
      error: 'Invalid or expired verification link.'
    });
  }

  // 2. Mark user as verified, clear the token
  await pool.query(
    `UPDATE users
     SET is_verified = TRUE,
         verification_token = NULL,
         token_expires_at = NULL
     WHERE id = $1`,
    [result.rows[0].id]
  );

  res.json({ message: 'Email verified successfully! You can now log in.' });
});
// GET /api/auth/my-permissions — get current logged-in user's permissions
router.get('/my-permissions', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT can_create, can_read, can_update, can_delete
       FROM roles
       WHERE role_name = $1`,
      [req.user.role]
    );

    if (result.rows.length === 0) {
      // role not found in roles table — give minimum access
      return res.json({
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      });
    }

    res.json(result.rows[0]);
    // example response:
    // { can_create: true, can_read: true, can_update: true, can_delete: true }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;