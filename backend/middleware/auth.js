const jwt = require('jsonwebtoken');
const pool = require('../db');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Check if user has required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};

// Check permission from roles table dynamically
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT ${permission} FROM roles WHERE role_name = $1`,
        [req.user.role]
      );
      if (result.rows.length === 0 || !result.rows[0][permission]) {
        return res.status(403).json({
          error: `Access denied. Your role '${req.user.role}' does not have '${permission}' permission.`
        });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};

module.exports = { verifyToken, requireRole, requirePermission };