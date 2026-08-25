const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:clinic.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function init() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT, dob TEXT, age INTEGER, gender TEXT,
      address TEXT, blood_group TEXT, allergies TEXT,
      medical_history TEXT, emergency_contact TEXT, emergency_phone TEXT, notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, category TEXT, description TEXT,
      duration_minutes INTEGER DEFAULT 30, base_price REAL DEFAULT 0, active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL, doctor_id INTEGER, service_id INTEGER,
      appointment_date TEXT NOT NULL, appointment_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled', notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL, appointment_id INTEGER, doctor_id INTEGER,
      visit_date TEXT NOT NULL DEFAULT (date('now')),
      chief_complaint TEXT, diagnosis TEXT, treatment_done TEXT,
      prescription TEXT, next_visit TEXT, notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL, visit_id INTEGER, service_id INTEGER, doctor_id INTEGER,
      treatment_date TEXT NOT NULL DEFAULT (date('now')),
      tooth_number TEXT, description TEXT, status TEXT DEFAULT 'in-progress',
      cost REAL DEFAULT 0, notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL, visit_id INTEGER,
      amount REAL NOT NULL, paid REAL NOT NULL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash', status TEXT DEFAULT 'pending',
      payment_date TEXT, notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS followups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL, visit_id INTEGER,
      followup_date TEXT NOT NULL, reason TEXT, status TEXT DEFAULT 'pending', notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT,
      preferred_date TEXT, preferred_time TEXT, service TEXT, message TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, action TEXT NOT NULL, table_name TEXT,
      record_id INTEGER, details TEXT, ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const { rows: sc } = await db.execute('SELECT COUNT(*) as c FROM services');
  if (Number(sc[0].c) === 0) {
    const services = [
      ['General Dentistry','General','Comprehensive oral health checkups',30,500],
      ['Dental Cleaning','Preventive','Professional scaling and polishing',45,800],
      ['Teeth Whitening','Cosmetic','Advanced whitening treatments',60,3000],
      ['Root Canal Treatment','Restorative','Pain-free root canal therapy',90,5000],
      ['Dental Implants','Implants','Permanent tooth replacement',120,25000],
      ['Crowns & Bridges','Restorative','Custom-crafted restorations',60,4000],
      ['Dental Fillings','Restorative','Tooth-colored composite fillings',30,800],
      ['Braces & Orthodontics','Orthodontics','Metal, ceramic and invisible aligners',60,15000],
      ['Pediatric Dentistry','Pediatric','Gentle child-friendly dental care',30,500],
      ['Gum Treatment','Periodontics','Advanced periodontal therapy',60,2000],
      ['Cosmetic Dentistry','Cosmetic','Smile makeovers and veneers',90,8000],
      ['Tooth Extraction','Oral Surgery','Safe comfortable tooth removal',30,500],
    ];
    for (const s of services) {
      await db.execute({ sql: 'INSERT INTO services (name,category,description,duration_minutes,base_price) VALUES (?,?,?,?,?)', args: s });
    }
  }

  const { rows: admin } = await db.execute({ sql: 'SELECT id FROM users WHERE email=?', args: ['admin@rksdental.com'] });
  if (admin.length === 0) {
    const hash = bcrypt.hashSync('Admin@123', 12);
    await db.execute({ sql: 'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', args: ['Dr. Admin', 'admin@rksdental.com', hash, 'admin'] });
  }
}

init().catch(console.error);
module.exports = db;
