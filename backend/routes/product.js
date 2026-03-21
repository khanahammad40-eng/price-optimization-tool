const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requirePermission } = require('../middleware/auth');

// GET /api/products — all users can read (with search + filter)
router.get('/', verifyToken, async (req, res) => {
  const { search, category, sort_by, order } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  // Search by name
  if (search) {
    query += ` AND name ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Filter by category
  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  // Sort
  const allowedSorts = ['name', 'selling_price', 'cost_price', 'units_sold', 'customer_rating', 'created_at'];
  const sortBy = allowedSorts.includes(sort_by) ? sort_by : 'id';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  try {
    const result = await pool.query(query, params);
    res.json({ count: result.rows.length, products: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — single product
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — admin or supplier only
router.post('/', verifyToken, requirePermission('can_create'), async (req, res) => {
  const { name, description, category, cost_price, selling_price, stock_available, units_sold, customer_rating, demand_forecast, optimized_price } = req.body;

  if (!name || !cost_price || !selling_price) {
    return res.status(400).json({ error: 'Name, cost_price, and selling_price are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products 
        (name, description, category, cost_price, selling_price, stock_available, units_sold, customer_rating, demand_forecast, optimized_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [name, description, category, cost_price, selling_price,
       stock_available || 0, units_sold || 0, customer_rating || null,
       demand_forecast || null, optimized_price || null]
    );
    res.status(201).json({ message: 'Product created.', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — admin or supplier only
router.put('/:id', verifyToken, requirePermission('can_update'), async (req, res) => {
  const { name, description, category, cost_price, selling_price, stock_available, units_sold, customer_rating, demand_forecast, optimized_price } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        cost_price = COALESCE($4, cost_price),
        selling_price = COALESCE($5, selling_price),
        stock_available = COALESCE($6, stock_available),
        units_sold = COALESCE($7, units_sold),
        customer_rating = COALESCE($8, customer_rating),
        demand_forecast = COALESCE($9, demand_forecast),
        optimized_price = COALESCE($10, optimized_price)
       WHERE id = $11
       RETURNING *`,
      [name, description, category, cost_price, selling_price,
       stock_available, units_sold, customer_rating,
       demand_forecast, optimized_price, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ message: 'Product updated.', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', verifyToken, requirePermission('can_delete'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id, name', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ message: `Product '${result.rows[0].name}' deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/meta/categories — get all unique categories
router.get('/meta/categories', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;