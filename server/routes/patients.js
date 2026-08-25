const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { authMiddleware, auditLog } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

const genPatientId = () => {
  const last = db.prepare("SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1").get();
  if (!last) return 'RKS-0001';
  const num = parseInt(last.patient_id.split('-')[1]) + 1;
  return `RKS-${String(num).padStart(4, '0')}`;
};

router.get('/', (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let query = 'SELECT id, patient_id, name, phone, email, age, gender, created_at FROM patients';
  let params = [];
  if (search) {
    query += ' WHERE name LIKE ? OR phone LIKE ? OR patient_id LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const patients = db.prepare(query).all(...params);
  const total = db.prepare(`SELECT COUNT(*) as c FROM patients${search ? ' WHERE name LIKE ? OR phone LIKE ? OR patient_id LIKE ?' : ''}`).get(...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []));
  res.json({ patients, total: total.c, page: +page, limit: +limit });
});

router.get('/:id', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

router.post('/', auditLog('CREATE_PATIENT', 'patients'), [
  body('name').trim().notEmpty(),
  body('phone').trim().notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  const { name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes } = req.body;
  const patient_id = genPatientId();
  const result = db.prepare('INSERT INTO patients (patient_id,name,phone,email,dob,age,gender,address,blood_group,allergies,medical_history,emergency_contact,emergency_phone,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(patient_id, name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes);
  res.status(201).json({ id: result.lastInsertRowid, patient_id });
});

router.put('/:id', auditLog('UPDATE_PATIENT', 'patients'), (req, res) => {
  const { name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes } = req.body;
  db.prepare('UPDATE patients SET name=?,phone=?,email=?,dob=?,age=?,gender=?,address=?,blood_group=?,allergies=?,medical_history=?,emergency_contact=?,emergency_phone=?,notes=?,updated_at=datetime("now") WHERE id=?')
    .run(name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes, req.params.id);
  res.json({ success: true });
});

router.get('/:id/visits', (req, res) => {
  const visits = db.prepare('SELECT v.*, u.name as doctor_name FROM visits v LEFT JOIN users u ON v.doctor_id=u.id WHERE v.patient_id=? ORDER BY v.visit_date DESC').all(req.params.id);
  res.json(visits);
});

router.get('/:id/appointments', (req, res) => {
  const appts = db.prepare('SELECT a.*, u.name as doctor_name, s.name as service_name FROM appointments a LEFT JOIN users u ON a.doctor_id=u.id LEFT JOIN services s ON a.service_id=s.id WHERE a.patient_id=? ORDER BY a.appointment_date DESC').all(req.params.id);
  res.json(appts);
});

router.get('/:id/treatments', (req, res) => {
  const treatments = db.prepare('SELECT t.*, s.name as service_name, u.name as doctor_name FROM treatments t LEFT JOIN services s ON t.service_id=s.id LEFT JOIN users u ON t.doctor_id=u.id WHERE t.patient_id=? ORDER BY t.treatment_date DESC').all(req.params.id);
  res.json(treatments);
});

router.get('/:id/payments', (req, res) => {
  const payments = db.prepare('SELECT * FROM payments WHERE patient_id=? ORDER BY created_at DESC').all(req.params.id);
  res.json(payments);
});

router.get('/:id/followups', (req, res) => {
  const followups = db.prepare('SELECT * FROM followups WHERE patient_id=? ORDER BY followup_date DESC').all(req.params.id);
  res.json(followups);
});

module.exports = router;
