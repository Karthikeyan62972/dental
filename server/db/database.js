const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'clinic.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('admin','doctor','staff')),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    dob TEXT,
    age INTEGER,
    gender TEXT CHECK(gender IN ('Male','Female','Other')),
    address TEXT,
    blood_group TEXT,
    allergies TEXT,
    medical_history TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    base_price REAL DEFAULT 0,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','confirmed','completed','cancelled','no-show')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    appointment_id INTEGER REFERENCES appointments(id),
    doctor_id INTEGER REFERENCES users(id),
    visit_date TEXT NOT NULL DEFAULT (date('now')),
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_done TEXT,
    prescription TEXT,
    next_visit TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    visit_id INTEGER REFERENCES visits(id),
    service_id INTEGER REFERENCES services(id),
    doctor_id INTEGER REFERENCES users(id),
    treatment_date TEXT NOT NULL DEFAULT (date('now')),
    tooth_number TEXT,
    description TEXT,
    status TEXT DEFAULT 'in-progress' CHECK(status IN ('planned','in-progress','completed')),
    cost REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    visit_id INTEGER REFERENCES visits(id),
    amount REAL NOT NULL,
    paid REAL NOT NULL DEFAULT 0,
    balance REAL GENERATED ALWAYS AS (amount - paid) VIRTUAL,
    payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash','card','upi','insurance','other')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','partial','paid')),
    payment_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS followups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    visit_id INTEGER REFERENCES visits(id),
    followup_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','missed')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT DEFAULT 'general',
    uploaded_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    service TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK(status IN ('new','contacted','booked','closed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed default services
const serviceCount = db.prepare('SELECT COUNT(*) as c FROM services').get();
if (serviceCount.c === 0) {
  const insertService = db.prepare('INSERT INTO services (name, category, description, duration_minutes, base_price) VALUES (?,?,?,?,?)');
  const services = [
    ['General Dentistry', 'General', 'Comprehensive oral health checkups and preventive care', 30, 500],
    ['Dental Cleaning', 'Preventive', 'Professional scaling and polishing for healthy gums', 45, 800],
    ['Teeth Whitening', 'Cosmetic', 'Advanced whitening for a brighter, confident smile', 60, 3000],
    ['Root Canal Treatment', 'Restorative', 'Pain-free root canal therapy to save your natural tooth', 90, 5000],
    ['Dental Implants', 'Implants', 'Permanent tooth replacement with titanium implants', 120, 25000],
    ['Crowns & Bridges', 'Restorative', 'Custom-crafted crowns and bridges for damaged teeth', 60, 4000],
    ['Dental Fillings', 'Restorative', 'Tooth-colored composite fillings for cavities', 30, 800],
    ['Braces & Orthodontics', 'Orthodontics', 'Metal, ceramic and invisible aligners for perfect alignment', 60, 15000],
    ['Pediatric Dentistry', 'Pediatric', 'Gentle, child-friendly dental care for young patients', 30, 500],
    ['Gum Treatment', 'Periodontics', 'Advanced treatment for gum disease and periodontitis', 60, 2000],
    ['Cosmetic Dentistry', 'Cosmetic', 'Smile makeovers, veneers and aesthetic enhancements', 90, 8000],
    ['Tooth Extraction', 'Oral Surgery', 'Safe and comfortable tooth removal procedures', 30, 500],
  ];
  services.forEach(s => insertService.run(...s));
}

// Seed default admin user
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@rksdental.com');
if (!adminExists) {
  const hash = bcrypt.hashSync('Admin@123', 12);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)').run('Dr. Admin', 'admin@rksdental.com', hash, 'admin');
}

module.exports = db;
