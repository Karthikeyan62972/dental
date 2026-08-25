const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const [[ta],[tp],[np],[ua],[pf],[pp],recentAppts] = await Promise.all([
    db.execute({ sql: 'SELECT COUNT(*) as c FROM appointments WHERE appointment_date=?', args: [today] }).then(r => r.rows),
    db.execute('SELECT COUNT(*) as c FROM patients').then(r => r.rows),
    db.execute({ sql: 'SELECT COUNT(*) as c FROM patients WHERE date(created_at)=?', args: [today] }).then(r => r.rows),
    db.execute({ sql: "SELECT COUNT(*) as c FROM appointments WHERE appointment_date>=? AND status='scheduled'", args: [today] }).then(r => r.rows),
    db.execute({ sql: "SELECT COUNT(*) as c FROM followups WHERE followup_date<=? AND status='pending'", args: [today] }).then(r => r.rows),
    db.execute("SELECT COALESCE(SUM(amount-paid),0) as total FROM payments WHERE status!='paid'").then(r => r.rows),
    db.execute({ sql: 'SELECT a.*,p.name as patient_name,s.name as service_name FROM appointments a LEFT JOIN patients p ON a.patient_id=p.id LEFT JOIN services s ON a.service_id=s.id WHERE a.appointment_date=? ORDER BY a.appointment_time LIMIT 10', args: [today] }).then(r => r.rows),
  ]);
  res.json({ todayAppts: Number(ta.c), totalPatients: Number(tp.c), newPatients: Number(np.c), upcomingAppts: Number(ua.c), pendingFollowups: Number(pf.c), pendingPayments: Number(pp.total), recentAppts });
});

router.get('/visits', async (req, res) => {
  const { rows } = await db.execute('SELECT v.*,p.name as patient_name,p.patient_id as pid,u.name as doctor_name FROM visits v LEFT JOIN patients p ON v.patient_id=p.id LEFT JOIN users u ON v.doctor_id=u.id ORDER BY v.visit_date DESC LIMIT 50');
  res.json(rows);
});

router.post('/visits', async (req, res) => {
  const { patient_id, appointment_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment_done, prescription, next_visit, notes } = req.body;
  const { lastInsertRowid } = await db.execute({ sql: 'INSERT INTO visits (patient_id,appointment_id,doctor_id,visit_date,chief_complaint,diagnosis,treatment_done,prescription,next_visit,notes) VALUES (?,?,?,?,?,?,?,?,?,?)', args: [patient_id, appointment_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment_done, prescription, next_visit, notes] });
  res.status(201).json({ id: Number(lastInsertRowid) });
});

router.get('/treatments', async (req, res) => {
  const { rows } = await db.execute('SELECT t.*,p.name as patient_name,p.patient_id as pid,s.name as service_name,u.name as doctor_name FROM treatments t LEFT JOIN patients p ON t.patient_id=p.id LEFT JOIN services s ON t.service_id=s.id LEFT JOIN users u ON t.doctor_id=u.id ORDER BY t.treatment_date DESC LIMIT 50');
  res.json(rows);
});

router.post('/treatments', async (req, res) => {
  const { patient_id, visit_id, service_id, doctor_id, treatment_date, tooth_number, description, status, cost, notes } = req.body;
  const { lastInsertRowid } = await db.execute({ sql: 'INSERT INTO treatments (patient_id,visit_id,service_id,doctor_id,treatment_date,tooth_number,description,status,cost,notes) VALUES (?,?,?,?,?,?,?,?,?,?)', args: [patient_id, visit_id, service_id, doctor_id, treatment_date, tooth_number, description, status, cost, notes] });
  res.status(201).json({ id: Number(lastInsertRowid) });
});

router.get('/payments', async (req, res) => {
  const { rows } = await db.execute('SELECT py.*,p.name as patient_name,p.patient_id as pid FROM payments py LEFT JOIN patients p ON py.patient_id=p.id ORDER BY py.created_at DESC LIMIT 50');
  res.json(rows);
});

router.post('/payments', async (req, res) => {
  const { patient_id, visit_id, amount, paid, payment_method, status, payment_date, notes } = req.body;
  const { lastInsertRowid } = await db.execute({ sql: 'INSERT INTO payments (patient_id,visit_id,amount,paid,payment_method,status,payment_date,notes) VALUES (?,?,?,?,?,?,?,?)', args: [patient_id, visit_id, amount, paid, payment_method, status, payment_date, notes] });
  res.status(201).json({ id: Number(lastInsertRowid) });
});

router.put('/payments/:id', async (req, res) => {
  const { paid, status, payment_method, payment_date, notes } = req.body;
  await db.execute({ sql: 'UPDATE payments SET paid=?,status=?,payment_method=?,payment_date=?,notes=? WHERE id=?', args: [paid, status, payment_method, payment_date, notes, req.params.id] });
  res.json({ success: true });
});

router.get('/followups', async (req, res) => {
  const { rows } = await db.execute('SELECT f.*,p.name as patient_name,p.patient_id as pid,p.phone FROM followups f LEFT JOIN patients p ON f.patient_id=p.id ORDER BY f.followup_date ASC');
  res.json(rows);
});

router.post('/followups', async (req, res) => {
  const { patient_id, visit_id, followup_date, reason, notes } = req.body;
  const { lastInsertRowid } = await db.execute({ sql: 'INSERT INTO followups (patient_id,visit_id,followup_date,reason,notes) VALUES (?,?,?,?,?)', args: [patient_id, visit_id, followup_date, reason, notes] });
  res.status(201).json({ id: Number(lastInsertRowid) });
});

router.put('/followups/:id', async (req, res) => {
  const { status, notes } = req.body;
  await db.execute({ sql: 'UPDATE followups SET status=?,notes=? WHERE id=?', args: [status, notes, req.params.id] });
  res.json({ success: true });
});

router.get('/services', async (req, res) => {
  const { rows } = await db.execute('SELECT * FROM services WHERE active=1');
  res.json(rows);
});

router.get('/users', async (req, res) => {
  const { rows } = await db.execute("SELECT id,name,email,role FROM users WHERE active=1 AND role IN ('doctor','admin')");
  res.json(rows);
});

module.exports = router;
