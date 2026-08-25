const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const router = express.Router();

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid credentials' });
  const { email, password } = req.body;
  const { rows } = await db.execute({ sql: 'SELECT * FROM users WHERE email=? AND active=1', args: [email] });
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  await db.execute({ sql: 'INSERT INTO audit_logs (user_id,action,ip_address) VALUES (?,?,?)', args: [user.id, 'LOGIN', req.ip] });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));

module.exports = router;
