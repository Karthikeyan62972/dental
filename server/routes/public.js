const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const router = express.Router();

router.post('/contact', [
  body('name').trim().notEmpty(),
  body('phone').trim().notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Name and phone are required' });
  const { name, phone, email, preferred_date, preferred_time, service, message } = req.body;
  db.prepare('INSERT INTO contact_submissions (name,phone,email,preferred_date,preferred_time,service,message) VALUES (?,?,?,?,?,?,?)')
    .run(name, phone, email, preferred_date, preferred_time, service, message);
  res.json({ success: true, message: 'Thank you! We will contact you shortly.' });
});

router.get('/services', (req, res) => {
  res.json(db.prepare('SELECT id, name, category, description, duration_minutes FROM services WHERE active=1').all());
});

module.exports = router;
