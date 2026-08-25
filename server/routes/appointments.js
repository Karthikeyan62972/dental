const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { date, status, patient_id } = req.query;
  let sql = 'SELECT a.*, p.name as patient_name, p.phone as patient_phone, u.name as doctor_name, s.name as service_name FROM appointments a LEFT JOIN patients p ON a.patient_id=p.id LEFT JOIN users u ON a.doctor_id=u.id LEFT JOIN services s ON a.service_id=s.id WHERE 1=1';
  const args = [];
  if (date) { sql += ' AND a.appointment_date=?'; args.push(date); }
  if (status) { sql += ' AND a.status=?'; args.push(status); }
  if (patient_id) { sql += ' AND a.patient_id=?'; args.push(patient_id); }
  sql += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';
  const { rows } = await db.execute({ sql, args });
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, service_id, appointment_date, appointment_time, notes } = req.body;
  const { lastInsertRowid } = await db.execute({ sql: 'INSERT INTO appointments (patient_id,doctor_id,service_id,appointment_date,appointment_time,notes) VALUES (?,?,?,?,?,?)', args: [patient_id, doctor_id, service_id, appointment_date, appointment_time, notes] });
  res.status(201).json({ id: Number(lastInsertRowid) });
});

router.put('/:id', async (req, res) => {
  const { status, doctor_id, service_id, appointment_date, appointment_time, notes } = req.body;
  await db.execute({ sql: 'UPDATE appointments SET status=?,doctor_id=?,service_id=?,appointment_date=?,appointment_time=?,notes=?,updated_at=datetime("now") WHERE id=?', args: [status, doctor_id, service_id, appointment_date, appointment_time, notes, req.params.id] });
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'UPDATE appointments SET status="cancelled" WHERE id=?', args: [req.params.id] });
  res.json({ success: true });
});

module.exports = router;
