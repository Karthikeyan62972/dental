const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = db.prepare("SELECT COUNT(*) as c FROM appointments WHERE appointment_date=?").get(today);
  const totalPatients = db.prepare("SELECT COUNT(*) as c FROM patients").get();
  const newPatients = db.prepare("SELECT COUNT(*) as c FROM patients WHERE date(created_at)=?").get(today);
  const upcomingAppts = db.prepare("SELECT COUNT(*) as c FROM appointments WHERE appointment_date>=? AND status='scheduled'").get(today);
  const pendingFollowups = db.prepare("SELECT COUNT(*) as c FROM followups WHERE followup_date<=? AND status='pending'").get(today);
  const pendingPayments = db.prepare("SELECT COALESCE(SUM(amount-paid),0) as total FROM payments WHERE status!='paid'").get();
  const recentAppts = db.prepare("SELECT a.*, p.name as patient_name, s.name as service_name FROM appointments a LEFT JOIN patients p ON a.patient_id=p.id LEFT JOIN services s ON a.service_id=s.id WHERE a.appointment_date=? ORDER BY a.appointment_time LIMIT 10").all(today);
  res.json({ todayAppts: todayAppts.c, totalPatients: totalPatients.c, newPatients: newPatients.c, upcomingAppts: upcomingAppts.c, pendingFollowups: pendingFollowups.c, pendingPayments: pendingPayments.total, recentAppts });
});

router.get('/visits', (req, res) => {
  const visits = db.prepare('SELECT v.*, p.name as patient_name, p.patient_id as pid, u.name as doctor_name FROM visits v LEFT JOIN patients p ON v.patient_id=p.id LEFT JOIN users u ON v.doctor_id=u.id ORDER BY v.visit_date DESC LIMIT 50').all();
  res.json(visits);
});

router.post('/visits', (req, res) => {
  const { patient_id, appointment_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment_done, prescription, next_visit, notes } = req.body;
  const result = db.prepare('INSERT INTO visits (patient_id,appointment_id,doctor_id,visit_date,chief_complaint,diagnosis,treatment_done,prescription,next_visit,notes) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(patient_id, appointment_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment_done, prescription, next_visit, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/treatments', (req, res) => {
  const treatments = db.prepare('SELECT t.*, p.name as patient_name, p.patient_id as pid, s.name as service_name, u.name as doctor_name FROM treatments t LEFT JOIN patients p ON t.patient_id=p.id LEFT JOIN services s ON t.service_id=s.id LEFT JOIN users u ON t.doctor_id=u.id ORDER BY t.treatment_date DESC LIMIT 50').all();
  res.json(treatments);
});

router.post('/treatments', (req, res) => {
  const { patient_id, visit_id, service_id, doctor_id, treatment_date, tooth_number, description, status, cost, notes } = req.body;
  const result = db.prepare('INSERT INTO treatments (patient_id,visit_id,service_id,doctor_id,treatment_date,tooth_number,description,status,cost,notes) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(patient_id, visit_id, service_id, doctor_id, treatment_date, tooth_number, description, status, cost, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/payments', (req, res) => {
  const payments = db.prepare('SELECT py.*, p.name as patient_name, p.patient_id as pid FROM payments py LEFT JOIN patients p ON py.patient_id=p.id ORDER BY py.created_at DESC LIMIT 50').all();
  res.json(payments);
});

router.post('/payments', (req, res) => {
  const { patient_id, visit_id, amount, paid, payment_method, status, payment_date, notes } = req.body;
  const result = db.prepare('INSERT INTO payments (patient_id,visit_id,amount,paid,payment_method,status,payment_date,notes) VALUES (?,?,?,?,?,?,?,?)')
    .run(patient_id, visit_id, amount, paid, payment_method, status, payment_date, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/payments/:id', (req, res) => {
  const { paid, status, payment_method, payment_date, notes } = req.body;
  db.prepare('UPDATE payments SET paid=?,status=?,payment_method=?,payment_date=?,notes=? WHERE id=?').run(paid, status, payment_method, payment_date, notes, req.params.id);
  res.json({ success: true });
});

router.get('/followups', (req, res) => {
  const followups = db.prepare('SELECT f.*, p.name as patient_name, p.patient_id as pid, p.phone FROM followups f LEFT JOIN patients p ON f.patient_id=p.id ORDER BY f.followup_date ASC').all();
  res.json(followups);
});

router.post('/followups', (req, res) => {
  const { patient_id, visit_id, followup_date, reason, notes } = req.body;
  const result = db.prepare('INSERT INTO followups (patient_id,visit_id,followup_date,reason,notes) VALUES (?,?,?,?,?)').run(patient_id, visit_id, followup_date, reason, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/followups/:id', (req, res) => {
  const { status, notes } = req.body;
  db.prepare('UPDATE followups SET status=?,notes=? WHERE id=?').run(status, notes, req.params.id);
  res.json({ success: true });
});

router.get('/services', (req, res) => res.json(db.prepare('SELECT * FROM services WHERE active=1').all()));

router.get('/users', (req, res) => res.json(db.prepare("SELECT id, name, email, role FROM users WHERE active=1 AND role IN ('doctor','admin')").all()));

module.exports = router;
