import express from 'express';
import { mockUsers, mockProducts, mockOrders } from './mockData.js';
import { auditLogs, can, permissionCatalog, recordAudit, rolePermissions } from './security.js';
import { authenticate, issueToken, publicUser } from './auth.js';

export default function createRoutes(io) {
const router = express.Router();

const notify = (notification) => io.emit('notification', { id: Date.now(), ...notification });
const audit = (data) => {
  const entry = recordAudit(data);
  notify({ type: 'success', title: 'Hoạt động mới', message: `${entry.action}: ${entry.details}` });
};

router.post('/auth/login', (req, res) => {
  const user = authenticate(req.body?.email, req.body?.password);
  if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  audit({ action: 'Đăng nhập', entity: 'Auth', entityId: user.id, details: `${user.email} đăng nhập thành công`, role: user.role, actor: user.name });
  res.json({ token: issueToken(user), user: publicUser(user) });
});

router.get('/auth/me', (req, res) => res.json({ user: { id: req.user.sub, name: req.user.name, email: req.user.email, role: req.user.role } }));

router.post('/auth/logout', (req, res) => {
  audit({ action: 'Đăng xuất', entity: 'Auth', entityId: req.user.sub, details: `${req.user.email} đăng xuất`, role: req.user.role, actor: req.user.name });
  res.json({ success: true });
});

const createSuggestion = (label, meta, type, id) => ({ label, meta, type, id });

const buildSearchResults = (query, type = 'all') => {
  const normalized = String(query).trim().toLowerCase();
  const results = [];

  if (type === 'all' || type === 'users') {
    results.push(...mockUsers
      .filter((user) => user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((user) => createSuggestion(user.name, `${user.role} • ${user.status}`, 'User', user.id)));
  }

  if (type === 'all' || type === 'products') {
    results.push(...mockProducts
      .filter((product) => product.name.toLowerCase().includes(normalized) || product.category.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((product) => createSuggestion(product.name, `${product.category} • ${product.status}`, 'Product', product.id)));
  }

  if (type === 'all' || type === 'orders') {
    results.push(...mockOrders
      .filter((order) => order.customer.toLowerCase().includes(normalized) || order.orderId.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((order) => createSuggestion(order.orderId, `${order.customer} • ${order.status}`, 'Order', order.id)));
  }

  return results.slice(0, 10);
};

const buildForecast = () => {
  const dailyTotals = mockOrders.reduce((acc, order) => {
    acc[order.date] = (acc[order.date] || 0) + order.total;
    return acc;
  }, {});

  const sortedDays = Object.keys(dailyTotals).sort();
  const revenueTrend = sortedDays.map((date, index) => ({
    name: date,
    revenue: dailyTotals[date],
    prediction: +(dailyTotals[date] * (1 + 0.08 * (index / sortedDays.length))).toFixed(2),
  }));

  const lowStock = mockProducts.filter((p) => p.stock < 20).map((p) => ({
    ...p,
    alert: p.stock === 0 ? 'Out of stock' : 'Low stock',
  }));

  const slowMovers = mockProducts.filter((p) => p.stock > 90).map((p) => ({ name: p.name, stock: p.stock }));

  return {
    revenueTrend,
    lowStock,
    slowMovers,
    summary: `Dự báo doanh số tăng khoảng ${Math.round(revenueTrend[revenueTrend.length - 1].prediction / 100)}% trong tuần tới và ${lowStock.length} sản phẩm cần bổ sung kho.`,
  };
};

const buildChatResponse = (message) => {
  const text = String(message || '').toLowerCase();

  if (text.includes('hôm nay') || text.includes('today')) {
    const today = new Date().toISOString().slice(0, 10);
    const count = mockOrders.filter((order) => order.date === today).length;
    return `Có ${count} đơn hàng ghi nhận cho hôm nay (${today}).`;
  }

  if (text.includes('hết hàng') || text.includes('out of stock')) {
    const products = mockProducts.filter((product) => product.stock === 0);
    return products.length > 0
      ? `Sản phẩm hết hàng: ${products.map((p) => p.name).join(', ')}.`
      : 'Hiện tại không có sản phẩm nào hết hàng.';
  }

  if (text.includes('tồn kho thấp') || text.includes('low stock')) {
    const lowStock = mockProducts.filter((product) => product.stock > 0 && product.stock < 20);
    return lowStock.length > 0
      ? `Sản phẩm tồn kho thấp: ${lowStock.map((p) => `${p.name} (${p.stock})`).join(', ')}.`
      : 'Không có sản phẩm tồn kho thấp hiện tại.';
  }

  if (text.includes('doanh số') || text.includes('revenue')) {
    const total = mockOrders.reduce((sum, order) => sum + order.total, 0);
    return `Tổng doanh số hiện tại là $${total.toFixed(2)} từ ${mockOrders.length} đơn hàng.`;
  }

  return 'Mình đã nhận câu hỏi của bạn. Bạn có thể hỏi “đơn hàng hôm nay”, “sản phẩm hết hàng” hoặc “tồn kho thấp”.';
};

const buildDescription = (product) => {
  const title = `${product.name} - ${product.category} đỉnh cao, giá chỉ ${product.price}$`;
  const description = `Khám phá ${product.name}, sản phẩm ${product.category} được đánh giá cao với ${product.stock} sản phẩm còn trong kho. Thích hợp cho người dùng cần một lựa chọn ${product.category} chất lượng, hiệu quả và giá cạnh tranh.`;
  return { title, description };
};

// Users endpoints
router.get('/users', (req, res) => {
  const { search, role, status } = req.query;
  let filtered = [...mockUsers];

  if (search) {
    filtered = filtered.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  }
  if (role && role !== 'All') {
    filtered = filtered.filter(u => u.role === role);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(u => u.status === status);
  }

  res.json(filtered);
});

router.get('/users/:id', (req, res) => {
  const user = mockUsers.find((item) => item.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const activity = auditLogs.filter((entry) => entry.entity === 'User' && entry.entityId === String(user.id));
  res.json({ user, activity });
});

router.post('/users', (req, res) => {
  const newUser = { id: Math.max(...mockUsers.map(u => u.id), 0) + 1, ...req.body };
  mockUsers.push(newUser);
  audit({ action: 'Tạo', entity: 'User', entityId: newUser.id, details: `Tạo người dùng ${newUser.name}`, role: req.user.role, actor: req.user.name });
  res.status(201).json(newUser);
});

router.put('/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  audit({ action: 'Cập nhật', entity: 'User', entityId: user.id, details: `Cập nhật người dùng ${user.name}`, role: req.user.role, actor: req.user.name });
  res.json(user);
});

// Products endpoints
router.get('/products', (req, res) => {
  const { search, category, status } = req.query;
  let filtered = [...mockProducts];

  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(p => p.status === status);
  }

  res.json(filtered);
});

router.get('/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.get('/inventory/summary', (req, res) => {
  const lowStockThreshold = Number(req.query.threshold) || 20;
  const summary = mockProducts.map((product) => ({
    ...product,
    reorderPoint: lowStockThreshold,
    inventoryValue: +(product.price * product.stock).toFixed(2),
    risk: product.stock === 0 ? 'Critical' : product.stock <= lowStockThreshold ? 'Warning' : 'Healthy',
  }));
  res.json({ items: summary, totals: { units: summary.reduce((sum, item) => sum + item.stock, 0), value: summary.reduce((sum, item) => sum + item.inventoryValue, 0), critical: summary.filter((item) => item.risk === 'Critical').length, warning: summary.filter((item) => item.risk === 'Warning').length } });
});

router.put('/inventory/:id/adjust', (req, res) => {
  const product = mockProducts.find((item) => item.id === parseInt(req.params.id));
  const quantity = Number(req.body.quantity);
  const reason = String(req.body.reason || '').trim();
  if (!product || !Number.isFinite(quantity) || quantity === 0 || !reason) return res.status(400).json({ error: 'Số lượng và lý do điều chỉnh là bắt buộc' });
  product.stock = Math.max(0, product.stock + quantity);
  product.status = product.stock === 0 ? 'Out of stock' : product.stock < 20 ? 'Low stock' : 'In stock';
  audit({ action: 'Điều chỉnh', entity: 'Product', entityId: product.id, details: `Điều chỉnh tồn kho ${product.name}: ${quantity > 0 ? '+' : ''}${quantity} (${reason})`, role: req.user.role, actor: req.user.name });
  notify({ type: product.stock < 20 ? 'warning' : 'success', title: 'Tồn kho cập nhật', message: `${product.name} còn ${product.stock} sản phẩm.` });
  res.json(product);
});

router.post('/products', (req, res) => {
  const stock = Math.max(0, Number(req.body.stock) || 0);
  const newProduct = { id: Math.max(...mockProducts.map(p => p.id), 0) + 1, ...req.body, stock, status: stock === 0 ? 'Out of stock' : stock < 20 ? 'Low stock' : 'In stock' };
  mockProducts.push(newProduct);
  audit({ action: 'Tạo', entity: 'Product', entityId: newProduct.id, details: `Tạo sản phẩm ${newProduct.name}`, role: req.user.role, actor: req.user.name });
  res.status(201).json(newProduct);
});

router.put('/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { stock: _stock, status: _status, ...catalogChanges } = req.body;
  Object.assign(product, catalogChanges);
  audit({ action: 'Cập nhật', entity: 'Product', entityId: product.id, details: `Cập nhật sản phẩm ${product.name}`, role: req.user.role, actor: req.user.name });
  res.json(product);
});

// Orders endpoints
router.get('/orders', (req, res) => {
  const { search, status } = req.query;
  let filtered = [...mockOrders];

  if (search) {
    filtered = filtered.filter(o => o.customer.toLowerCase().includes(search.toLowerCase()) || o.orderId.toLowerCase().includes(search.toLowerCase()));
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(o => o.status === status);
  }

  res.json(filtered);
});

router.get('/orders/:id', (req, res) => {
  const order = mockOrders.find((item) => item.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const activity = auditLogs.filter((entry) => entry.entity === 'Order' && entry.entityId === String(order.id));
  res.json({ order, activity });
});

router.get('/backup', (req, res) => res.json({ exportedAt: new Date().toISOString(), users: mockUsers, products: mockProducts, orders: mockOrders }));

router.post('/backup/restore', (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.users) || !Array.isArray(payload.products) || !Array.isArray(payload.orders)) return res.status(400).json({ error: 'Invalid backup file' });
  mockUsers.splice(0, mockUsers.length, ...payload.users);
  mockProducts.splice(0, mockProducts.length, ...payload.products);
  mockOrders.splice(0, mockOrders.length, ...payload.orders);
  audit({ action: 'Khôi phục', entity: 'System', details: 'Khôi phục dữ liệu từ bản backup', role: req.user.role, actor: req.user.name });
  res.json({ restored: true });
});

// AI endpoints
router.get('/ai/search', (req, res) => {
  const { q, type } = req.query;
  if (!q || String(q).trim() === '') {
    return res.json([]);
  }
  res.json(buildSearchResults(q, type));
});

router.post('/ai/chat', (req, res) => {
  const { message } = req.body;
  const response = buildChatResponse(message);
  res.json({ response });
});

router.get('/ai/forecast', (req, res) => {
  res.json(buildForecast());
});

router.post('/ai/describe', (req, res) => {
  const { product } = req.body;
  if (!product || !product.name || !product.category) {
    return res.status(400).json({ error: 'Missing product data' });
  }
  res.json(buildDescription(product));
});

router.put('/orders/:id/status', (req, res) => {
  const order = mockOrders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status;
  audit({ action: 'Cập nhật', entity: 'Order', entityId: order.id, details: `Đơn ${order.orderId} chuyển sang ${order.status}`, role: req.user.role, actor: req.user.name });
  notify({ type: 'warning', title: 'Đơn hàng cập nhật', message: `${order.orderId} đang ở trạng thái ${order.status}.` });
  res.json(order);
});

router.get('/rbac', (req, res) => res.json({ roles: rolePermissions, permissions: permissionCatalog }));

router.get('/audit-logs', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  res.json(auditLogs.slice(0, limit));
});

router.get('/analytics', (req, res) => {
  const revenueByDate = mockOrders.reduce((acc, order) => {
    acc[order.date] = (acc[order.date] || 0) + order.total;
    return acc;
  }, {});
  const statusBreakdown = mockOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  const categoryBreakdown = mockProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.stock;
    return acc;
  }, {});
  res.json({
    revenueByDate: Object.entries(revenueByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({ date, revenue })),
    statusBreakdown: Object.entries(statusBreakdown).map(([name, value]) => ({ name, value })),
    categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
    totals: { revenue: mockOrders.reduce((sum, order) => sum + order.total, 0), orders: mockOrders.length, products: mockProducts.length, users: mockUsers.length },
  });
});

router.get('/permissions/check', (req, res) => {
  const role = String(req.query.role || 'Viewer');
  const permission = String(req.query.permission || 'dashboard.view');
  res.json({ role, permission, allowed: can(role, permission) });
});

return router;
}
