const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const admin = rows[0];
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Menu endpoints
app.get('/api/menu', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM menu');
  res.json(rows);
});
app.post('/api/menu', authenticateToken, async (req, res) => {
  const { name, description, price, category, veg, spicy_level } = req.body;
  await db.query('INSERT INTO menu (name, description, price, category, veg, spicy_level) VALUES (?, ?, ?, ?, ?, ?)', [name, description, price, category, veg, spicy_level]);
  res.json({ success: true });
});
app.put('/api/menu/:id', authenticateToken, async (req, res) => {
  const { name, description, price, category, veg, spicy_level } = req.body;
  await db.query('UPDATE menu SET name=?, description=?, price=?, category=?, veg=?, spicy_level=? WHERE id=?', [name, description, price, category, veg, spicy_level, req.params.id]);
  res.json({ success: true });
});
app.delete('/api/menu/:id', authenticateToken, async (req, res) => {
  await db.query('DELETE FROM menu WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// Order endpoints
app.post('/api/order', async (req, res) => {
  const { table_number, payment_method, total, items } = req.body;
  const [orderResult] = await db.query('INSERT INTO orders (table_number, payment_method, total) VALUES (?, ?, ?)', [table_number, payment_method, total]);
  const orderId = orderResult.insertId;
  for (const item of items) {
    await db.query('INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.menu_id, item.quantity, item.price]);
  }
  res.json({ success: true, order_id: orderId });
});
app.get('/api/orders', authenticateToken, async (req, res) => {
  const [orders] = await db.query('SELECT * FROM orders ORDER BY order_time DESC');
  for (const order of orders) {
    const [items] = await db.query('SELECT oi.*, m.name FROM order_items oi JOIN menu m ON oi.menu_id = m.id WHERE oi.order_id = ?', [order.id]);
    order.items = items;
  }
  res.json(orders);
});
app.get('/api/order/:id', authenticateToken, async (req, res) => {
  const [orders] = await db.query('SELECT * FROM orders WHERE id=?', [req.params.id]);
  if (!orders.length) return res.status(404).json({ error: 'Order not found' });
  const order = orders[0];
  const [items] = await db.query('SELECT oi.*, m.name FROM order_items oi JOIN menu m ON oi.menu_id = m.id WHERE oi.order_id = ?', [order.id]);
  order.items = items;
  res.json(order);
});

// Analytics endpoint
app.get('/api/analytics', authenticateToken, async (req, res) => {
  const [[{ total_sales }]] = await db.query('SELECT SUM(total) as total_sales FROM orders');
  const [ordersPerDay] = await db.query('SELECT DATE(order_time) as date, COUNT(*) as count FROM orders GROUP BY DATE(order_time)');
  res.json({ total_sales, ordersPerDay });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 