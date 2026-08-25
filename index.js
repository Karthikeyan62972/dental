require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts' } });

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/public', require('./server/routes/public'));
app.use('/api/patients', require('./server/routes/patients'));
app.use('/api/appointments', require('./server/routes/appointments'));
app.use('/api/clinic', require('./server/routes/clinic'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.get('/admin/*splat', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
app.get('/*splat', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RKS Dental Clinic running on http://localhost:${PORT}`));
