export const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2026-06-20' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', lastLogin: '2026-06-19' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', lastLogin: '2026-06-15' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Manager', status: 'Active', lastLogin: '2026-06-20' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active', lastLogin: '2026-06-18' },
];

export const mockProducts = [
  { id: 1, name: 'Essence Mascara Lash Princess', category: 'beauty', price: 9.99, stock: 99, status: 'In stock' },
  { id: 2, name: 'Red Lipstick', category: 'beauty', price: 12.99, stock: 91, status: 'In stock' },
  { id: 3, name: 'Laptop', category: 'electronics', price: 999.99, stock: 15, status: 'In stock' },
  { id: 4, name: 'Wireless Mouse', category: 'electronics', price: 25.50, stock: 150, status: 'In stock' },
  { id: 5, name: 'Coffee Maker', category: 'appliances', price: 89.99, stock: 8, status: 'Low stock' },
];

export const mockOrders = [
  { id: 1, orderId: 'ORD-1001', customer: 'Emily Johnson', product: 'Laptop', total: 999.99, status: 'Delivered', date: '2026-06-18' },
  { id: 2, orderId: 'ORD-1002', customer: 'Michael Williams', product: 'Wireless Mouse', total: 25.50, status: 'Shipped', date: '2026-06-17' },
  { id: 3, orderId: 'ORD-1003', customer: 'Sophia Brown', product: 'Red Lipstick', total: 12.99, status: 'Processing', date: '2026-06-16' },
  { id: 4, orderId: 'ORD-1004', customer: 'James Davis', product: 'Coffee Maker', total: 89.99, status: 'Shipped', date: '2026-06-15' },
  { id: 5, orderId: 'ORD-1005', customer: 'Emma Miller', product: 'Laptop', total: 999.99, status: 'Delivered', date: '2026-06-14' },
];
