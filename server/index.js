import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import routes from './routes.js';
import { authMiddleware, permissionMiddleware } from './auth.js';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', authMiddleware, permissionMiddleware, routes(io));

io.on('connection', (socket) => {
  socket.emit('notification', { id: Date.now(), type: 'info', title: 'Đã kết nối realtime', message: 'Thông báo hệ thống đang hoạt động.' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

httpServer.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
