import { Order, Product, User } from '../types';

export const dashboardMetrics = [
  { label: 'Người dùng hoạt động', value: '1,240', caption: '+8.5% tuần này' },
  { label: 'Sản phẩm', value: '540', caption: '+3.1% tồn kho' },
  { label: 'Đơn hàng', value: '320', caption: '+5.9% mới' },
  { label: 'Doanh thu', value: '$24.8K', caption: '+12.7% hàng tháng' },
];

export const ordersChartData = [
  { name: 'T2', sales: 180 },
  { name: 'T3', sales: 220 },
  { name: 'T4', sales: 190 },
  { name: 'T5', sales: 240 },
  { name: 'T6', sales: 260 },
  { name: 'T7', sales: 210 },
  { name: 'CN', sales: 230 },
];

export const users: User[] = [
  { id: 1, name: 'Lina Nguyen', email: 'lina.nguyen@example.com', role: 'Quản trị viên', status: 'Hoạt động', lastLogin: '2026-06-17' },
  { id: 2, name: 'Minh Tran', email: 'minh.tran@example.com', role: 'Quản lý', status: 'Hoạt động', lastLogin: '2026-06-17' },
  { id: 3, name: 'Huy Le', email: 'huy.le@example.com', role: 'Hỗ trợ', status: 'Không hoạt động', lastLogin: '2026-06-15' },
  { id: 4, name: 'Trang Pham', email: 'trang.pham@example.com', role: 'Biên tập viên', status: 'Hoạt động', lastLogin: '2026-06-16' },
  { id: 5, name: 'Nam Vo', email: 'nam.vo@example.com', role: 'Quản trị viên', status: 'Hoạt động', lastLogin: '2026-06-17' },
  { id: 6, name: 'Nga Hoang', email: 'nga.hoang@example.com', role: 'Quản lý', status: 'Chờ xử lý', lastLogin: '2026-06-14' },
];

export const products: Product[] = [
  { id: 1, name: 'Smart Watch', category: 'Wearables', price: 129.9, stock: 58, status: 'Còn hàng' },
  { id: 2, name: 'Gaming Headset', category: 'Audio', price: 79.5, stock: 120, status: 'Còn hàng' },
  { id: 3, name: 'Wireless Mouse', category: 'Accessories', price: 45.0, stock: 175, status: 'Còn hàng' },
  { id: 4, name: '4K Monitor', category: 'Displays', price: 329.0, stock: 24, status: 'Sắp hết' },
  { id: 5, name: 'Bluetooth Speaker', category: 'Audio', price: 59.99, stock: 90, status: 'Còn hàng' },
  { id: 6, name: 'Office Chair', category: 'Furniture', price: 189.0, stock: 34, status: 'Còn hàng' },
];

export const orders: Order[] = [
  { id: 1, orderId: 'ORD-1024', customer: 'Lina Nguyen', product: 'Smart Watch', total: 129.9, status: 'Đã giao', date: '2026-06-17' },
  { id: 2, orderId: 'ORD-1025', customer: 'Minh Tran', product: 'Gaming Headset', total: 79.5, status: 'Đang xử lý', date: '2026-06-17' },
  { id: 3, orderId: 'ORD-1026', customer: 'Trang Pham', product: '4K Monitor', total: 329.0, status: 'Đang vận chuyển', date: '2026-06-16' },
  { id: 4, orderId: 'ORD-1027', customer: 'Huy Le', product: 'Wireless Mouse', total: 45.0, status: 'Đã giao', date: '2026-06-15' },
  { id: 5, orderId: 'ORD-1028', customer: 'Nam Vo', product: 'Office Chair', total: 189.0, status: 'Đã hủy', date: '2026-06-14' },
  { id: 6, orderId: 'ORD-1029', customer: 'Nga Hoang', product: 'Bluetooth Speaker', total: 59.99, status: 'Chờ xử lý', date: '2026-06-13' },
];
