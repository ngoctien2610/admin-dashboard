import express from 'express';
import { mockUsers, mockProducts, mockOrders } from './mockData.js';

const router = express.Router();

const createSuggestion = (label, meta, type) => ({ label, meta, type });

const buildSearchResults = (query, type = 'all') => {
  const normalized = String(query).trim().toLowerCase();
  const results = [];

  if (type === 'all' || type === 'users') {
    results.push(...mockUsers
      .filter((user) => user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((user) => createSuggestion(user.name, `${user.role} • ${user.status}`, 'User')));
  }

  if (type === 'all' || type === 'products') {
    results.push(...mockProducts
      .filter((product) => product.name.toLowerCase().includes(normalized) || product.category.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((product) => createSuggestion(product.name, `${product.category} • ${product.status}`, 'Product')));
  }

  if (type === 'all' || type === 'orders') {
    results.push(...mockOrders
      .filter((order) => order.customer.toLowerCase().includes(normalized) || order.orderId.toLowerCase().includes(normalized))
      .slice(0, 5)
      .map((order) => createSuggestion(order.orderId, `${order.customer} • ${order.status}`, 'Order')));
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

router.post('/users', (req, res) => {
  const newUser = { id: Math.max(...mockUsers.map(u => u.id), 0) + 1, ...req.body };
  mockUsers.push(newUser);
  res.status(201).json(newUser);
});

router.put('/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
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

router.post('/products', (req, res) => {
  const newProduct = { id: Math.max(...mockProducts.map(p => p.id), 0) + 1, ...req.body };
  mockProducts.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  Object.assign(product, req.body);
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
  res.json(order);
});

export default router;
