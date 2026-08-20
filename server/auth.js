import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { can } from './security.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-admin-development-secret';
const users = [
  { id: 1, name: 'Quản trị viên', email: 'admin@nexus.local', role: 'Admin', passwordHash: bcrypt.hashSync('Admin@123', 10) },
  { id: 2, name: 'Quản lý vận hành', email: 'manager@nexus.local', role: 'Manager', passwordHash: bcrypt.hashSync('Manager@123', 10) },
  { id: 3, name: 'Hỗ trợ khách hàng', email: 'support@nexus.local', role: 'Support', passwordHash: bcrypt.hashSync('Support@123', 10) },
  { id: 4, name: 'Người xem báo cáo', email: 'viewer@nexus.local', role: 'Viewer', passwordHash: bcrypt.hashSync('Viewer@123', 10) },
];

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function authenticate(email, password) {
  const user = users.find((item) => item.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) return null;
  return user;
}

export function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
}

export function authMiddleware(req, res, next) {
  if (req.path === '/auth/login') return next();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  }
}

export function permissionMiddleware(req, res, next) {
  if (!req.user || req.path === '/auth/login') return next();
  // Authenticated users need read-only permission metadata so the UI can explain route access accurately.
  if (req.path === '/rbac' && req.method === 'GET') return next();
  let permission = null;
  if (req.path.startsWith('/analytics')) permission = 'analytics.view';
  if (req.path.startsWith('/audit-logs')) permission = 'audit.view';
  if (req.path.startsWith('/rbac')) permission = 'rbac.manage';
  if (req.path.startsWith('/users') && ['POST', 'PUT'].includes(req.method)) permission = 'users.manage';
  if (req.path.startsWith('/products') && ['POST', 'PUT'].includes(req.method)) permission = 'products.manage';
  if (req.path.startsWith('/inventory') && req.method === 'PUT') permission = 'products.manage';
  if (req.path.startsWith('/orders') && req.method === 'PUT') permission = 'orders.manage';
  if (permission && !can(req.user.role, permission)) return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này', permission });
  next();
}
