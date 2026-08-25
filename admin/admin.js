// ===== STATE =====
const state = {
  token: localStorage.getItem('rks_token'),
  user: JSON.parse(localStorage.getItem('rks_user') || 'null'),
  page: 'dashboard',
  patients: [], appointments: [], services: [], doctors: [],
  currentPatient: null,
};

// ===== API =====
const api = async (method, path, body) => {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}) } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`/api${path}`, opts);
  if (res.status === 401) { logout(); return null; }
  return res.json();
};

// ===== AUTH =====
async function login(email, password) {
  const data = await api('POST', '/auth/login', { email, password });
  if (data?.token) {
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('rks_token', data.token);
    localStorage.setItem('rks_user', JSON.stringify(data.user));
    renderApp();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').textContent = data?.error || 'Login failed';
  }
}

function logout() {
  state.token = null; state.user = null;
  localStorage.removeItem('rks_token'); localStorage.removeItem('rks_user');
  renderApp();
}

// ===== RENDER =====
function renderApp() {
  const app = document.getElementById('adminApp');
  if (!state.token) { app.innerHTML = renderLogin(); bindLogin(); return; }
  app.innerHTML = renderLayout();
  bindNav();
  loadPage(state.page);
}

function renderLogin() {
  return `<div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <h1>RKS <span>Dental</span></h1>
        <p>Admin Dashboard — Secure Access</p>
      </div>
      <div class="login-error" id="loginError"></div>
      <form class="login-form" id="loginForm">
        <div class="form-group"><label>Email Address</label><input type="email" id="loginEmail" value="admin@rksdental.com" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="loginPassword" value="Admin@123" required></div>
        <button type="submit" class="login-btn"><i class="fas fa-lock"></i> Sign In</button>
      </form>
    </div>
  </div>`;
}

function bindLogin() {
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
  });
}

function renderLayout() {
  const nav = [
    { section: 'Main' },
    { id: 'dashboard', icon: 'fa-gauge', label: 'Dashboard' },
    { section: 'Patients' },
    { id: 'patients', icon: 'fa-users', label: 'Patients' },
    { id: 'appointments', icon: 'fa-calendar-check', label: 'Appointments' },
    { section: 'Clinical' },
    { id: 'visits', icon: 'fa-stethoscope', label: 'Visits' },
    { id: 'treatments', icon: 'fa-tooth', label: 'Treatments' },
    { id: 'followups', icon: 'fa-bell', label: 'Follow-ups' },
    { section: 'Finance' },
    { id: 'payments', icon: 'fa-credit-card', label: 'Payments' },
    { section: 'Settings' },
    { id: 'staff', icon: 'fa-user-shield', label: 'Staff & Users' },
  ];
  const navHtml = nav.map(n => n.section
    ? `<div class="nav-section">${n.section}</div>`
    : `<div class="nav-item ${state.page === n.id ? 'active' : ''}" data-page="${n.id}"><i class="fas ${n.icon}"></i> ${n.label}</div>`
  ).join('');
  const initials = state.user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AD';
  return `
    <div class="admin-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo"><h2>RKS <span>Dental</span></h2><p>Admin Dashboard</p></div>
        <nav class="sidebar-nav">${navHtml}</nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">${initials}</div>
            <div><div class="user-name">${state.user?.name || 'Admin'}</div><div class="user-role">${state.user?.role || 'admin'}</div></div>
            <button class="logout-btn" onclick="logout()" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
          </div>
        </div>
      </aside>
      <div class="main-content">
        <header class="topbar">
          <div class="topbar-title" id="topbarTitle">Dashboard</div>
          <div class="topbar-right">
            <span class="topbar-date">${new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</span>
            <a href="/" target="_blank" class="btn btn-ghost btn-sm"><i class="fas fa-external-link-alt"></i> View Site</a>
          </div>
        </header>
        <main class="page-content" id="pageContent"></main>
      </div>
    </div>
    <div class="toast-container" id="toastContainer"></div>
  `;
}

function bindNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      state.page = el.dataset.page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('topbarTitle').textContent = el.textContent.trim();
      loadPage(state.page);
    });
  });
}

async function loadPage(page) {
  const content = document.getElementById('pageContent');
  content.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--mid)"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;
  switch (page) {
    case 'dashboard': await renderDashboard(); break;
    case 'patients': await renderPatients(); break;
    case 'appointments': await renderAppointments(); break;
    case 'visits': await renderVisits(); break;
    case 'treatments': await renderTreatments(); break;
    case 'followups': await renderFollowups(); break;
    case 'payments': await renderPayments(); break;
    case 'staff': await renderStaff(); break;
    default: content.innerHTML = '<div class="empty-state"><i class="fas fa-construction"></i><p>Coming soon</p></div>';
  }
}

function toast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function showModal(html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  return overlay;
}

// ===== DASHBOARD =====
async function renderDashboard() {
  const d = await api('GET', '/clinic/dashboard');
  if (!d) return;
  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-calendar-day"></i></div><div><div class="stat-value">${d.todayAppts}</div><div class="stat-label">Today's Appointments</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-users"></i></div><div><div class="stat-value">${d.totalPatients}</div><div class="stat-label">Total Patients</div></div></div>
      <div class="stat-card"><div class="stat-icon yellow"><i class="fas fa-bell"></i></div><div><div class="stat-value">${d.pendingFollowups}</div><div class="stat-label">Pending Follow-ups</div></div></div>
      <div class="stat-card"><div class="stat-icon red"><i class="fas fa-rupee-sign"></i></div><div><div class="stat-value">₹${Number(d.pendingPayments).toLocaleString('en-IN')}</div><div class="stat-label">Outstanding Payments</div></div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fas fa-calendar-day" style="color:var(--primary);margin-right:0.5rem"></i>Today's Appointments</span>
        <button class="btn btn-primary btn-sm" onclick="state.page='appointments';loadPage('appointments')"><i class="fas fa-arrow-right"></i> View All</button>
      </div>
      <div class="card-body">
        ${d.recentAppts.length === 0 ? '<div class="empty-state"><i class="fas fa-calendar-xmark"></i><p>No appointments today</p></div>' : `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Patient</th><th>Service</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${d.recentAppts.map(a => `
              <tr>
                <td><strong>${a.appointment_time}</strong></td>
                <td>${a.patient_name}</td>
                <td>${a.service_name || '—'}</td>
                <td>${statusBadge(a.status)}</td>
                <td><button class="btn btn-ghost btn-sm" onclick="quickStatus(${a.id})"><i class="fas fa-edit"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`}
      </div>
    </div>`;
}

function statusBadge(status) {
  const map = { scheduled: 'blue', confirmed: 'green', completed: 'green', cancelled: 'red', 'no-show': 'yellow', pending: 'yellow', partial: 'yellow', paid: 'green', 'in-progress': 'blue', planned: 'gray', missed: 'red', new: 'blue', contacted: 'yellow', booked: 'green' };
  return `<span class="badge badge-${map[status] || 'gray'}">${status}</span>`;
}

async function quickStatus(id) {
  const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
  const overlay = showModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Update Status</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:0.5rem">
      ${statuses.map(s => `<button class="btn btn-ghost" style="justify-content:flex-start" onclick="updateApptStatus(${id},'${s}',this.closest('.modal-overlay'))">${statusBadge(s)} ${s}</button>`).join('')}
    </div>
  </div>`);
}

async function updateApptStatus(id, status, overlay) {
  await api('PUT', `/appointments/${id}`, { status });
  overlay.remove();
  toast('Status updated');
  loadPage(state.page);
}

// ===== PATIENTS =====
async function renderPatients(search = '') {
  const url = search ? `/patients?search=${encodeURIComponent(search)}` : '/patients';
  const data = await api('GET', url);
  if (!data) return;
  state.patients = data.patients;
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div class="page-title">Patients <span style="font-size:0.85rem;color:var(--mid);font-weight:400">(${data.total})</span></div>
      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
        <div class="search-bar"><i class="fas fa-search"></i><input type="text" id="patientSearch" placeholder="Search by name, phone, ID..." value="${search}"></div>
        <button class="btn btn-primary" onclick="showAddPatient()"><i class="fas fa-plus"></i> Add Patient</button>
      </div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Patient ID</th><th>Name</th><th>Phone</th><th>Age/Gender</th><th>Registered</th><th>Actions</th></tr></thead>
          <tbody>${data.patients.length === 0 ? `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-users"></i><p>No patients found</p></div></td></tr>` :
            data.patients.map(p => `<tr>
              <td><span class="badge badge-blue">${p.patient_id}</span></td>
              <td><div class="patient-name-cell"><div class="patient-avatar">${p.name.charAt(0)}</div>${p.name}</div></td>
              <td>${p.phone}</td>
              <td>${p.age || '—'} / ${p.gender || '—'}</td>
              <td>${new Date(p.created_at).toLocaleDateString('en-IN')}</td>
              <td style="display:flex;gap:0.4rem">
                <button class="btn btn-ghost btn-sm btn-icon" onclick="viewPatient(${p.id})" title="View Profile"><i class="fas fa-eye"></i></button>
                <button class="btn btn-outline btn-sm btn-icon" onclick="showEditPatient(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn btn-primary btn-sm btn-icon" onclick="showAddAppointment(${p.id},'${p.name}')" title="Book Appointment"><i class="fas fa-calendar-plus"></i></button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  document.getElementById('patientSearch').addEventListener('input', debounce(e => renderPatients(e.target.value), 400));
}

function showAddPatient(prefill = {}) {
  const overlay = showModal(`<div class="modal modal-lg">
    <div class="modal-header"><span class="modal-title">Add New Patient</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="patientForm">
        <div class="form-grid">
          <div class="form-group"><label>Full Name *</label><input name="name" required placeholder="Patient full name" value="${prefill.name||''}"></div>
          <div class="form-group"><label>Phone *</label><input name="phone" required placeholder="+91 00000 00000" value="${prefill.phone||''}"></div>
          <div class="form-group"><label>Email</label><input name="email" type="email" placeholder="email@example.com"></div>
          <div class="form-group"><label>Date of Birth</label><input name="dob" type="date"></div>
          <div class="form-group"><label>Age</label><input name="age" type="number" placeholder="Age in years"></div>
          <div class="form-group"><label>Gender</label><select name="gender"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="form-group full"><label>Address</label><input name="address" placeholder="Full address"></div>
          <div class="form-group"><label>Blood Group</label><select name="blood_group"><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
          <div class="form-group"><label>Emergency Contact</label><input name="emergency_contact" placeholder="Contact name"></div>
          <div class="form-group"><label>Emergency Phone</label><input name="emergency_phone" placeholder="Emergency phone"></div>
          <div class="form-group full"><label>Allergies</label><input name="allergies" placeholder="Known allergies"></div>
          <div class="form-group full"><label>Medical History</label><textarea name="medical_history" placeholder="Relevant medical history..."></textarea></div>
          <div class="form-group full"><label>Notes</label><textarea name="notes" placeholder="Additional notes..."></textarea></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Patient</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#patientForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('POST', '/patients', body);
    if (res?.id) { overlay.remove(); toast('Patient added successfully'); renderPatients(); }
    else toast(res?.error || 'Failed to add patient', 'error');
  });
}

async function showEditPatient(id) {
  const p = await api('GET', `/patients/${id}`);
  if (!p) return;
  const overlay = showModal(`<div class="modal modal-lg">
    <div class="modal-header"><span class="modal-title">Edit Patient — ${p.name}</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="editPatientForm">
        <div class="form-grid">
          <div class="form-group"><label>Full Name *</label><input name="name" required value="${p.name||''}"></div>
          <div class="form-group"><label>Phone *</label><input name="phone" required value="${p.phone||''}"></div>
          <div class="form-group"><label>Email</label><input name="email" type="email" value="${p.email||''}"></div>
          <div class="form-group"><label>Date of Birth</label><input name="dob" type="date" value="${p.dob||''}"></div>
          <div class="form-group"><label>Age</label><input name="age" type="number" value="${p.age||''}"></div>
          <div class="form-group"><label>Gender</label><select name="gender"><option value="">Select</option>${['Male','Female','Other'].map(g=>`<option ${p.gender===g?'selected':''}>${g}</option>`).join('')}</select></div>
          <div class="form-group full"><label>Address</label><input name="address" value="${p.address||''}"></div>
          <div class="form-group"><label>Blood Group</label><select name="blood_group"><option value="">Select</option>${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=>`<option ${p.blood_group===g?'selected':''}>${g}</option>`).join('')}</select></div>
          <div class="form-group"><label>Emergency Contact</label><input name="emergency_contact" value="${p.emergency_contact||''}"></div>
          <div class="form-group"><label>Emergency Phone</label><input name="emergency_phone" value="${p.emergency_phone||''}"></div>
          <div class="form-group full"><label>Allergies</label><input name="allergies" value="${p.allergies||''}"></div>
          <div class="form-group full"><label>Medical History</label><textarea name="medical_history">${p.medical_history||''}</textarea></div>
          <div class="form-group full"><label>Notes</label><textarea name="notes">${p.notes||''}</textarea></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Update Patient</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#editPatientForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('PUT', `/patients/${id}`, body);
    if (res?.success) { overlay.remove(); toast('Patient updated'); renderPatients(); }
    else toast('Failed to update', 'error');
  });
}

// ===== PATIENT PROFILE =====
async function viewPatient(id) {
  state.currentPatient = await api('GET', `/patients/${id}`);
  if (!state.currentPatient) return;
  state.page = 'patient-profile';
  renderPatientProfile('overview');
}

async function renderPatientProfile(tab = 'overview') {
  const p = state.currentPatient;
  const tabs = ['overview', 'visits', 'treatments', 'appointments', 'payments', 'followups', 'notes'];
  document.getElementById('pageContent').innerHTML = `
    <div style="margin-bottom:1rem">
      <button class="btn btn-ghost btn-sm" onclick="state.page='patients';renderPatients()"><i class="fas fa-arrow-left"></i> Back to Patients</button>
    </div>
    <div class="profile-header">
      <div class="profile-avatar">${p.name.charAt(0)}</div>
      <div>
        <div class="profile-name">${p.name}</div>
        <div class="profile-id">Patient ID: ${p.patient_id}</div>
        <div class="profile-meta">
          <span class="profile-meta-item"><i class="fas fa-phone"></i>${p.phone}</span>
          ${p.email ? `<span class="profile-meta-item"><i class="fas fa-envelope"></i>${p.email}</span>` : ''}
          ${p.age ? `<span class="profile-meta-item"><i class="fas fa-birthday-cake"></i>${p.age} yrs</span>` : ''}
          ${p.gender ? `<span class="profile-meta-item"><i class="fas fa-venus-mars"></i>${p.gender}</span>` : ''}
          ${p.blood_group ? `<span class="profile-meta-item"><i class="fas fa-tint"></i>${p.blood_group}</span>` : ''}
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-outline btn-sm" onclick="showEditPatient(${p.id})"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-primary btn-sm" onclick="showAddAppointment(${p.id},'${p.name}')"><i class="fas fa-calendar-plus"></i> Book Appointment</button>
      </div>
    </div>
    <div class="tabs">${tabs.map(t => `<div class="tab ${t===tab?'active':''}" onclick="renderPatientProfile('${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</div>`).join('')}</div>
    <div id="profileTabContent"></div>`;
  await renderProfileTab(tab);
}

async function renderProfileTab(tab) {
  const p = state.currentPatient;
  const el = document.getElementById('profileTabContent');
  if (tab === 'overview') {
    el.innerHTML = `<div class="form-grid">
      <div class="card"><div class="card-header"><span class="card-title">Personal Information</span></div><div class="card-body">
        ${infoRow('Address', p.address)} ${infoRow('Date of Birth', p.dob)} ${infoRow('Blood Group', p.blood_group)} ${infoRow('Allergies', p.allergies)}
      </div></div>
      <div class="card"><div class="card-header"><span class="card-title">Medical & Emergency</span></div><div class="card-body">
        ${infoRow('Medical History', p.medical_history)} ${infoRow('Emergency Contact', p.emergency_contact)} ${infoRow('Emergency Phone', p.emergency_phone)}
      </div></div>
    </div>`;
  } else if (tab === 'visits') {
    const visits = await api('GET', `/patients/${p.id}/visits`);
    el.innerHTML = `<div class="card">
      <div class="card-header"><span class="card-title">Visit History</span><button class="btn btn-primary btn-sm" onclick="showAddVisit(${p.id})"><i class="fas fa-plus"></i> Add Visit</button></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Doctor</th><th>Complaint</th><th>Diagnosis</th><th>Treatment</th></tr></thead>
      <tbody>${visits?.length ? visits.map(v => `<tr><td>${v.visit_date}</td><td>${v.doctor_name||'—'}</td><td>${v.chief_complaint||'—'}</td><td>${v.diagnosis||'—'}</td><td>${v.treatment_done||'—'}</td></tr>`).join('') : '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-stethoscope"></i><p>No visits recorded</p></div></td></tr>'}</tbody>
      </table></div></div>`;
  } else if (tab === 'treatments') {
    const treatments = await api('GET', `/patients/${p.id}/treatments`);
    el.innerHTML = `<div class="card">
      <div class="card-header"><span class="card-title">Treatment History</span><button class="btn btn-primary btn-sm" onclick="showAddTreatment(${p.id})"><i class="fas fa-plus"></i> Add Treatment</button></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Service</th><th>Doctor</th><th>Tooth</th><th>Status</th><th>Cost</th></tr></thead>
      <tbody>${treatments?.length ? treatments.map(t => `<tr><td>${t.treatment_date}</td><td>${t.service_name||t.description||'—'}</td><td>${t.doctor_name||'—'}</td><td>${t.tooth_number||'—'}</td><td>${statusBadge(t.status)}</td><td>₹${t.cost||0}</td></tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-tooth"></i><p>No treatments recorded</p></div></td></tr>'}</tbody>
      </table></div></div>`;
  } else if (tab === 'appointments') {
    const appts = await api('GET', `/patients/${p.id}/appointments`);
    el.innerHTML = `<div class="card">
      <div class="card-header"><span class="card-title">Appointments</span><button class="btn btn-primary btn-sm" onclick="showAddAppointment(${p.id},'${p.name}')"><i class="fas fa-plus"></i> Book</button></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Time</th><th>Service</th><th>Doctor</th><th>Status</th></tr></thead>
      <tbody>${appts?.length ? appts.map(a => `<tr><td>${a.appointment_date}</td><td>${a.appointment_time}</td><td>${a.service_name||'—'}</td><td>${a.doctor_name||'—'}</td><td>${statusBadge(a.status)}</td></tr>`).join('') : '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-calendar"></i><p>No appointments</p></div></td></tr>'}</tbody>
      </table></div></div>`;
  } else if (tab === 'payments') {
    const payments = await api('GET', `/patients/${p.id}/payments`);
    const total = payments?.reduce((s,p) => s + p.amount, 0) || 0;
    const paid = payments?.reduce((s,p) => s + p.paid, 0) || 0;
    el.innerHTML = `<div class="stats-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:1rem">
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-file-invoice"></i></div><div><div class="stat-value">₹${total.toLocaleString('en-IN')}</div><div class="stat-label">Total Billed</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div><div class="stat-value">₹${paid.toLocaleString('en-IN')}</div><div class="stat-label">Total Paid</div></div></div>
      <div class="stat-card"><div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div><div><div class="stat-value">₹${(total-paid).toLocaleString('en-IN')}</div><div class="stat-label">Balance Due</div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Payment History</span><button class="btn btn-primary btn-sm" onclick="showAddPayment(${p.id})"><i class="fas fa-plus"></i> Add Payment</button></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th></tr></thead>
      <tbody>${payments?.length ? payments.map(py => `<tr><td>${py.payment_date||py.created_at?.split('T')[0]||'—'}</td><td>₹${py.amount}</td><td>₹${py.paid}</td><td>₹${py.amount-py.paid}</td><td>${py.payment_method}</td><td>${statusBadge(py.status)}</td></tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-credit-card"></i><p>No payments</p></div></td></tr>'}</tbody>
      </table></div></div>`;
  } else if (tab === 'followups') {
    const followups = await api('GET', `/patients/${p.id}/followups`);
    el.innerHTML = `<div class="card">
      <div class="card-header"><span class="card-title">Follow-ups</span><button class="btn btn-primary btn-sm" onclick="showAddFollowup(${p.id})"><i class="fas fa-plus"></i> Add Follow-up</button></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Reason</th><th>Status</th></tr></thead>
      <tbody>${followups?.length ? followups.map(f => `<tr><td>${f.followup_date}</td><td>${f.reason||'—'}</td><td>${statusBadge(f.status)}</td></tr>`).join('') : '<tr><td colspan="3"><div class="empty-state"><i class="fas fa-bell"></i><p>No follow-ups</p></div></td></tr>'}</tbody>
      </table></div></div>`;
  } else if (tab === 'notes') {
    el.innerHTML = `<div class="card"><div class="card-header"><span class="card-title">Clinical Notes</span></div><div class="card-body">
      <p style="white-space:pre-wrap;font-size:0.9rem;color:var(--dark-3)">${p.notes || 'No notes recorded for this patient.'}</p>
    </div></div>`;
  }
}

function infoRow(label, value) {
  if (!value) return '';
  return `<div style="margin-bottom:0.75rem"><div style="font-size:0.72rem;font-weight:600;color:var(--mid);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.2rem">${label}</div><div style="font-size:0.9rem;color:var(--dark)">${value}</div></div>`;
}

// ===== APPOINTMENTS =====
async function renderAppointments() {
  const [appts, services, doctors] = await Promise.all([
    api('GET', '/appointments'),
    api('GET', '/clinic/services'),
    api('GET', '/clinic/users'),
  ]);
  state.services = services || [];
  state.doctors = doctors || [];
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div class="page-title">Appointments</div>
      <button class="btn btn-primary" onclick="showAddAppointment()"><i class="fas fa-plus"></i> New Appointment</button>
    </div>
    <div class="filter-row">
      <select class="filter-select" id="apptStatusFilter" onchange="filterAppointments()">
        <option value="">All Statuses</option>
        <option>scheduled</option><option>confirmed</option><option>completed</option><option>cancelled</option><option>no-show</option>
      </select>
      <input type="date" class="filter-select" id="apptDateFilter" onchange="filterAppointments()" value="${new Date().toISOString().split('T')[0]}">
    </div>
    <div class="card">
      <div class="table-wrap">
        <table id="apptTable">
          <thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Service</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${renderApptRows(appts || [])}</tbody>
        </table>
      </div>
    </div>`;
  window._allAppts = appts || [];
}

function renderApptRows(appts) {
  if (!appts.length) return `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-calendar-xmark"></i><p>No appointments found</p></div></td></tr>`;
  return appts.map(a => `<tr>
    <td>${a.appointment_date}</td><td><strong>${a.appointment_time}</strong></td>
    <td><div class="patient-name-cell"><div class="patient-avatar">${(a.patient_name||'?').charAt(0)}</div>${a.patient_name||'—'}</div></td>
    <td>${a.service_name||'—'}</td><td>${a.doctor_name||'—'}</td>
    <td>${statusBadge(a.status)}</td>
    <td style="display:flex;gap:0.4rem">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="quickStatus(${a.id})" title="Update Status"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="cancelAppt(${a.id})" title="Cancel"><i class="fas fa-times"></i></button>
    </td>
  </tr>`).join('');
}

function filterAppointments() {
  const status = document.getElementById('apptStatusFilter').value;
  const date = document.getElementById('apptDateFilter').value;
  let filtered = window._allAppts || [];
  if (status) filtered = filtered.filter(a => a.status === status);
  if (date) filtered = filtered.filter(a => a.appointment_date === date);
  document.querySelector('#apptTable tbody').innerHTML = renderApptRows(filtered);
}

async function cancelAppt(id) {
  if (!confirm('Cancel this appointment?')) return;
  await api('DELETE', `/appointments/${id}`);
  toast('Appointment cancelled');
  renderAppointments();
}

async function showAddAppointment(patientId = null, patientName = '') {
  const [services, doctors, patients] = await Promise.all([
    api('GET', '/clinic/services'),
    api('GET', '/clinic/users'),
    api('GET', '/patients?limit=100'),
  ]);
  const patientOptions = (patients?.patients || []).map(p => `<option value="${p.id}" ${p.id==patientId?'selected':''}>${p.name} (${p.patient_id})</option>`).join('');
  const serviceOptions = (services || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  const doctorOptions = (doctors || []).map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  const today = new Date().toISOString().split('T')[0];
  const overlay = showModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Book Appointment</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="apptForm">
        <div class="form-group"><label>Patient *</label><select name="patient_id" required><option value="">Select patient</option>${patientOptions}</select></div>
        <div class="form-grid">
          <div class="form-group"><label>Date *</label><input name="appointment_date" type="date" required value="${today}"></div>
          <div class="form-group"><label>Time *</label><input name="appointment_time" type="time" required value="10:00"></div>
        </div>
        <div class="form-group"><label>Service</label><select name="service_id"><option value="">Select service</option>${serviceOptions}</select></div>
        <div class="form-group"><label>Doctor</label><select name="doctor_id"><option value="">Select doctor</option>${doctorOptions}</select></div>
        <div class="form-group"><label>Notes</label><textarea name="notes" placeholder="Any special notes..."></textarea></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-calendar-check"></i> Book Appointment</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#apptForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('POST', '/appointments', body);
    if (res?.id) { overlay.remove(); toast('Appointment booked'); loadPage(state.page); }
    else toast('Failed to book appointment', 'error');
  });
}

// ===== VISITS =====
async function renderVisits() {
  const visits = await api('GET', '/clinic/visits');
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div class="page-title">Visits</div>
      <button class="btn btn-primary" onclick="showAddVisit()"><i class="fas fa-plus"></i> Record Visit</button>
    </div>
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Complaint</th><th>Diagnosis</th><th>Treatment</th></tr></thead>
        <tbody>${visits?.length ? visits.map(v => `<tr>
          <td>${v.visit_date}</td>
          <td><div class="patient-name-cell"><div class="patient-avatar">${(v.patient_name||'?').charAt(0)}</div><div><div>${v.patient_name||'—'}</div><div style="font-size:0.72rem;color:var(--mid)">${v.pid||''}</div></div></div></td>
          <td>${v.doctor_name||'—'}</td><td>${v.chief_complaint||'—'}</td><td>${v.diagnosis||'—'}</td><td>${v.treatment_done||'—'}</td>
        </tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-stethoscope"></i><p>No visits recorded</p></div></td></tr>'}
        </tbody>
      </table></div>
    </div>`;
}

async function showAddVisit(patientId = null) {
  const [patients, doctors] = await Promise.all([api('GET', '/patients?limit=100'), api('GET', '/clinic/users')]);
  const patientOptions = (patients?.patients || []).map(p => `<option value="${p.id}" ${p.id==patientId?'selected':''}>${p.name} (${p.patient_id})</option>`).join('');
  const doctorOptions = (doctors || []).map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  const overlay = showModal(`<div class="modal modal-lg">
    <div class="modal-header"><span class="modal-title">Record Visit</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="visitForm">
        <div class="form-grid">
          <div class="form-group"><label>Patient *</label><select name="patient_id" required><option value="">Select patient</option>${patientOptions}</select></div>
          <div class="form-group"><label>Doctor</label><select name="doctor_id"><option value="">Select doctor</option>${doctorOptions}</select></div>
          <div class="form-group"><label>Visit Date</label><input name="visit_date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label>Next Visit</label><input name="next_visit" type="date"></div>
          <div class="form-group full"><label>Chief Complaint</label><input name="chief_complaint" placeholder="Patient's main complaint"></div>
          <div class="form-group full"><label>Diagnosis</label><textarea name="diagnosis" placeholder="Clinical diagnosis..."></textarea></div>
          <div class="form-group full"><label>Treatment Done</label><textarea name="treatment_done" placeholder="Treatment performed today..."></textarea></div>
          <div class="form-group full"><label>Prescription</label><textarea name="prescription" placeholder="Medications prescribed..."></textarea></div>
          <div class="form-group full"><label>Notes</label><textarea name="notes" placeholder="Additional clinical notes..."></textarea></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Visit</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#visitForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('POST', '/clinic/visits', body);
    if (res?.id) { overlay.remove(); toast('Visit recorded'); loadPage(state.page); }
    else toast('Failed to save visit', 'error');
  });
}

// ===== TREATMENTS =====
async function renderTreatments() {
  const treatments = await api('GET', '/clinic/treatments');
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div class="page-title">Treatments</div>
      <button class="btn btn-primary" onclick="showAddTreatment()"><i class="fas fa-plus"></i> Add Treatment</button>
    </div>
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Patient</th><th>Service</th><th>Doctor</th><th>Tooth</th><th>Status</th><th>Cost</th></tr></thead>
        <tbody>${treatments?.length ? treatments.map(t => `<tr>
          <td>${t.treatment_date}</td>
          <td><div class="patient-name-cell"><div class="patient-avatar">${(t.patient_name||'?').charAt(0)}</div>${t.patient_name||'—'}</div></td>
          <td>${t.service_name||t.description||'—'}</td><td>${t.doctor_name||'—'}</td><td>${t.tooth_number||'—'}</td>
          <td>${statusBadge(t.status)}</td><td>₹${t.cost||0}</td>
        </tr>`).join('') : '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-tooth"></i><p>No treatments recorded</p></div></td></tr>'}
        </tbody>
      </table></div>
    </div>`;
}

async function showAddTreatment(patientId = null) {
  const [patients, services, doctors] = await Promise.all([api('GET', '/patients?limit=100'), api('GET', '/clinic/services'), api('GET', '/clinic/users')]);
  const patientOptions = (patients?.patients || []).map(p => `<option value="${p.id}" ${p.id==patientId?'selected':''}>${p.name} (${p.patient_id})</option>`).join('');
  const serviceOptions = (services || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  const doctorOptions = (doctors || []).map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  const overlay = showModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Add Treatment</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="treatmentForm">
        <div class="form-group"><label>Patient *</label><select name="patient_id" required><option value="">Select patient</option>${patientOptions}</select></div>
        <div class="form-grid">
          <div class="form-group"><label>Service</label><select name="service_id"><option value="">Select service</option>${serviceOptions}</select></div>
          <div class="form-group"><label>Doctor</label><select name="doctor_id"><option value="">Select doctor</option>${doctorOptions}</select></div>
          <div class="form-group"><label>Treatment Date</label><input name="treatment_date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label>Tooth Number</label><input name="tooth_number" placeholder="e.g. 11, 21, 36"></div>
          <div class="form-group"><label>Cost (₹)</label><input name="cost" type="number" placeholder="0"></div>
          <div class="form-group"><label>Status</label><select name="status"><option value="planned">Planned</option><option value="in-progress" selected>In Progress</option><option value="completed">Completed</option></select></div>
        </div>
        <div class="form-group"><label>Description</label><textarea name="description" placeholder="Treatment details..."></textarea></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Treatment</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#treatmentForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('POST', '/clinic/treatments', body);
    if (res?.id) { overlay.remove(); toast('Treatment saved'); loadPage(state.page); }
    else toast('Failed to save treatment', 'error');
  });
}

// ===== PAYMENTS =====
async function renderPayments() {
  const payments = await api('GET', '/clinic/payments');
  const total = payments?.reduce((s,p) => s + p.amount, 0) || 0;
  const paid = payments?.reduce((s,p) => s + p.paid, 0) || 0;
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div class="page-title">Payments</div>
      <button class="btn btn-primary" onclick="showAddPayment()"><i class="fas fa-plus"></i> Add Payment</button>
    </div>
    <div class="stats-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.25rem">
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-file-invoice-dollar"></i></div><div><div class="stat-value">₹${total.toLocaleString('en-IN')}</div><div class="stat-label">Total Billed</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div><div class="stat-value">₹${paid.toLocaleString('en-IN')}</div><div class="stat-label">Total Collected</div></div></div>
      <div class="stat-card"><div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div><div><div class="stat-value">₹${(total-paid).toLocaleString('en-IN')}</div><div class="stat-label">Outstanding</div></div></div>
    </div>
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Patient</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${payments?.length ? payments.map(p => `<tr>
          <td>${p.payment_date||p.created_at?.split('T')[0]||'—'}</td>
          <td><div class="patient-name-cell"><div class="patient-avatar">${(p.patient_name||'?').charAt(0)}</div>${p.patient_name||'—'}</div></td>
          <td>₹${p.amount}</td><td>₹${p.paid}</td><td>₹${p.amount-p.paid}</td>
          <td>${p.payment_method}</td><td>${statusBadge(p.status)}</td>
          <td><button class="btn btn-outline btn-sm" onclick="showUpdatePayment(${p.id},${p.amount},${p.paid})"><i class="fas fa-edit"></i></button></td>
        </tr>`).join('') : '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-credit-card"></i><p>No payments recorded</p></div></td></tr>'}
        </tbody>
      </table></div>
    </div>`;
}

async function showAddPayment(patientId = null) {
  const patients = await api('GET', '/patients?limit=100');
  const patientOptions = (patients?.patients || []).map(p => `<option value="${p.id}" ${p.id==patientId?'selected':''}>${p.name} (${p.patient_id})</option>`).join('');
  const overlay = showModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Add Payment</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="paymentForm">
        <div class="form-group"><label>Patient *</label><select name="patient_id" required><option value="">Select patient</option>${patientOptions}</select></div>
        <div class="form-grid">
          <div class="form-group"><label>Total Amount (₹) *</label><input name="amount" type="number" required placeholder="0"></div>
          <div class="form-group"><label>Amount Paid (₹)</label><input name="paid" type="number" placeholder="0" value="0"></div>
          <div class="form-group"><label>Payment Method</label><select name="payment_method"><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="insurance">Insurance</option><option value="other">Other</option></select></div>
          <div class="form-group"><label>Status</label><select name="status"><option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option></select></div>
          <div class="form-group"><label>Payment Date</label><input name="payment_date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
        </div>
        <div class="form-group"><label>Notes</label><textarea name="notes" placeholder="Payment notes..."></textarea></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Payment</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#paymentForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('POST', '/clinic/payments', body);
    if (res?.id) { overlay.remove(); toast('Payment saved'); loadPage(state.page); }
    else toast('Failed to save payment', 'error');
  });
}

function showUpdatePayment(id, amount, currentPaid) {
  const overlay = showModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Update Payment</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="updatePaymentForm">
        <div class="form-group"><label>Amount Paid (₹)</label><input name="paid" type="number" value="${currentPaid}" required></div>
        <div class="form-group"><label>Payment Method</label><select name="payment_method"><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="insurance">Insurance</option></select></div>
        <div class="form-group"><label>Status</label><select name="status"><option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option></select></div>
        <div class="form-group"><label>Payment Date</label><input name="payment_date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#updatePaymentForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('PUT', `/clinic/payments/${id}`, body);
    if (res?.success) { overlay.remove(); toast('Payment updated'); loadPage(state.page); }
    else toast('Failed to update', 'error');
  });
}

// ===== FOLLOW-UPS =====
async function renderFollowups() {
  const followups = await api('GET', '/clinic/followups');
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div class="page-title">Follow-ups</div>
      <button class="btn btn-primary" onclick="showAddFollowup()"><i class="fas fa-plus"></i> Add Follow-up</button>
    </div>
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Patient</th><th>Phone</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${followups?.length ? followups.map(f => `<tr>
          <td>${f.followup_date}</td>
          <td><div class="patient-name-cell"><div class="patient-avatar">${(f.patient_name||'?').charAt(0)}</div>${f.patient_name||'—'}</div></td>
          <td>${f.phone||'—'}</td><td>${f.reason||'—'}</td><td>${statusBadge(f.status)}</td>
          <td style="display:flex;gap:0.4rem">
            <button class="btn btn-ghost btn-sm" onclick="markFollowup(${f.id},'completed')"><i class="fas fa-check"></i> Done</button>
            <button class="btn btn-danger btn-sm" onclick="markFollowup(${f.id},'missed')"><i class="fas fa-times"></i></button>
          </td>
        </tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-bell"></i><p>No follow-ups scheduled</p></div></td></tr>'}
        </tbody>
      </table></div>
    </div>`;
}

async function markFollowup(id, status) {
  await api('PUT', `/clinic/followups/${id}`, { status });
  toast(`Follow-up marked as ${status}`);
  renderFollowups();
}

async function showAddFollowup(patientId = null) {
  const patients = await api('GET', '/patients?limit=100');
  const patientOptions = (patients?.patients || []).map(p => `<option value="${p.id}" ${p.id==patientId?'selected':''}>${p.name} (${p.patient_id})</option>`).join('');
  const overlay = showModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Schedule Follow-up</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <form id="followupForm">
        <div class="form-group"><label>Patient *</label><select name="patient_id" required><option value="">Select patient</option>${patientOptions}</select></div>
        <div class="form-group"><label>Follow-up Date *</label><input name="followup_date" type="date" required></div>
        <div class="form-group"><label>Reason</label><input name="reason" placeholder="Reason for follow-up"></div>
        <div class="form-group"><label>Notes</label><textarea name="notes" placeholder="Additional notes..."></textarea></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Schedule</button>
        </div>
      </form>
    </div>
  </div>`);
  overlay.querySelector('#followupForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const res = await api('POST', '/clinic/followups', body);
    if (res?.id) { overlay.remove(); toast('Follow-up scheduled'); loadPage(state.page); }
    else toast('Failed to schedule', 'error');
  });
}

// ===== STAFF =====
async function renderStaff() {
  const users = await api('GET', '/clinic/users');
  document.getElementById('pageContent').innerHTML = `
    <div class="page-header"><div class="page-title">Staff & Users</div></div>
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>${users?.length ? users.map(u => `<tr>
          <td><div class="patient-name-cell"><div class="patient-avatar">${u.name.charAt(0)}</div>${u.name}</div></td>
          <td>${u.email}</td><td>${statusBadge(u.role)}</td>
        </tr>`).join('') : '<tr><td colspan="3"><div class="empty-state"><i class="fas fa-users"></i><p>No staff found</p></div></td></tr>'}
        </tbody>
      </table></div>
    </div>`;
}

// ===== UTILS =====
function debounce(fn, delay) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ===== INIT =====
renderApp();
