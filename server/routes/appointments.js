const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  const { date, status, patient_id } = req.query;
  let query = 'SELECT a.*, p.name as patient_name, p.phone as patient_phone, u.name as doctor_name, s.name as service_name FROM appointments a LEFT JOIN patients p ON a.patient_id=p.id LEFT JOIN users u ON a.doctor_id=u.id LEFT JOIN services s ON a.service_id=s.id WHERE 1=1';
  const params = [];
  if (date) { query += ' AND a.appointment_date=?'; params.push(date); }
  if (status) { query += ' AND a.status=?'; params.push(status); }
  if (patient_id) { query += ' AND a.patient_id=?'; params.push(patient_id); }
  query += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';
  res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
  const { patient_id, doctor_id, service_id, appointment_date, appointment_time, notes } = req.body;
  const result = db.prepare('INSERT INTO appointments (patient_id,doctor_id,service_id,appointment_date,appointment_time,notes) VALUES (?,?,?,?,?,?)')
    .run(patient_id, doctor_id, service_id, appointment_date, appointment_time, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { status, doctor_id, service_id, appointment_date, appointment_time, notes } = req.body;
  db.prepare('UPDATE appointments SET status=?,doctor_id=?,service_id=?,appointment_date=?,appointment_time=?,notes=?,updated_at=datetime("now") WHERE id=?')
    .run(status, doctor_id, service_id, appointment_date, appointment_time, notes, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('UPDATE appointments SET status="cancelled" WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
