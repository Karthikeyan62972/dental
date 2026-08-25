const jwt = require('jsonwebtoken');
const db = require('../db/database');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role, active FROM users WHERE id = ?').get(decoded.id);
    if (!user || !user.active) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

const auditLog = (action, tableName) => (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 400 && req.user) {
      try {
        db.prepare('INSERT INTO audit_logs (user_id, action, table_name, record_id, details, ip_address) VALUES (?,?,?,?,?,?)')
          .run(req.user.id, action, tableName, req.params.id || null, JSON.stringify({ body: req.body }), req.ip);
      } catch {}
    }
  });
  next();
};

module.exports = { authMiddleware, requireRole, auditLog };
