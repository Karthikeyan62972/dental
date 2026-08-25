const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

async function genPatientId() {
  const { rows } = await db.execute('SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1');
  if (!rows.length) return 'RKS-0001';
  const num = parseInt(rows[0].patient_id.split('-')[1]) + 1;
  return `RKS-${String(num).padStart(4, '0')}`;
}

router.get('/', async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let sql = 'SELECT id,patient_id,name,phone,email,age,gender,created_at FROM patients';
  const args = [];
  if (search) { sql += ' WHERE name LIKE ? OR phone LIKE ? OR patient_id LIKE ?'; args.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(Number(limit), Number(offset));
  const { rows: patients } = await db.execute({ sql, args });
  const countSql = search ? 'SELECT COUNT(*) as c FROM patients WHERE name LIKE ? OR phone LIKE ? OR patient_id LIKE ?' : 'SELECT COUNT(*) as c FROM patients';
  const countArgs = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  const { rows: ct } = await db.execute({ sql: countSql, args: countArgs });
  res.json({ patients, total: Number(ct[0].c), page: +page, limit: +limit });
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM patients WHERE id=?', args: [req.params.id] });
  if (!rows.length) return res.status(404).json({ error: 'Patient not found' });
  res.json(rows[0]);
});

router.post('/', [body('name').trim().notEmpty(), body('phone').trim().notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  const { name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes } = req.body;
  const patient_id = await genPatientId();
  const { lastInsertRowid } = await db.execute({ sql: 'INSERT INTO patients (patient_id,name,phone,email,dob,age,gender,address,blood_group,allergies,medical_history,emergency_contact,emergency_phone,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', args: [patient_id, name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes] });
  res.status(201).json({ id: Number(lastInsertRowid), patient_id });
});

router.put('/:id', async (req, res) => {
  const { name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes } = req.body;
  await db.execute({ sql: 'UPDATE patients SET name=?,phone=?,email=?,dob=?,age=?,gender=?,address=?,blood_group=?,allergies=?,medical_history=?,emergency_contact=?,emergency_phone=?,notes=?,updated_at=datetime("now") WHERE id=?', args: [name, phone, email, dob, age, gender, address, blood_group, allergies, medical_history, emergency_contact, emergency_phone, notes, req.params.id] });
  res.json({ success: true });
});

router.get('/:id/visits', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT v.*,u.name as doctor_name FROM visits v LEFT JOIN users u ON v.doctor_id=u.id WHERE v.patient_id=? ORDER BY v.visit_date DESC', args: [req.params.id] });
  res.json(rows);
});

router.get('/:id/appointments', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT a.*,u.name as doctor_name,s.name as service_name FROM appointments a LEFT JOIN users u ON a.doctor_id=u.id LEFT JOIN services s ON a.service_id=s.id WHERE a.patient_id=? ORDER BY a.appointment_date DESC', args: [req.params.id] });
  res.json(rows);
});

router.get('/:id/treatments', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT t.*,s.name as service_name,u.name as doctor_name FROM treatments t LEFT JOIN services s ON t.service_id=s.id LEFT JOIN users u ON t.doctor_id=u.id WHERE t.patient_id=? ORDER BY t.treatment_date DESC', args: [req.params.id] });
  res.json(rows);
});

router.get('/:id/payments', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM payments WHERE patient_id=? ORDER BY created_at DESC', args: [req.params.id] });
  res.json(rows);
});

router.get('/:id/followups', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM followups WHERE patient_id=? ORDER BY followup_date DESC', args: [req.params.id] });
  res.json(rows);
});

module.exports = router;
