export const permissionCatalog = [
  { key: 'dashboard.view', label: 'Xem tổng quan', group: 'Dashboard' },
  { key: 'analytics.view', label: 'Xem analytics', group: 'Analytics' },
  { key: 'users.view', label: 'Xem người dùng', group: 'Người dùng' },
  { key: 'users.manage', label: 'Thêm/sửa người dùng', group: 'Người dùng' },
  { key: 'products.view', label: 'Xem sản phẩm', group: 'Sản phẩm' },
  { key: 'products.manage', label: 'Thêm/sửa sản phẩm', group: 'Sản phẩm' },
  { key: 'orders.view', label: 'Xem đơn hàng', group: 'Đơn hàng' },
  { key: 'orders.manage', label: 'Cập nhật đơn hàng', group: 'Đơn hàng' },
  { key: 'audit.view', label: 'Xem audit log', group: 'Bảo mật' },
  { key: 'rbac.manage', label: 'Quản lý quyền', group: 'Bảo mật' },
];

export const rolePermissions = {
  Admin: permissionCatalog.map((permission) => permission.key),
  Manager: ['dashboard.view', 'analytics.view', 'users.view', 'products.view', 'products.manage', 'orders.view', 'orders.manage'],
  Support: ['dashboard.view', 'users.view', 'products.view', 'orders.view', 'orders.manage'],
  Viewer: ['dashboard.view', 'analytics.view', 'users.view', 'products.view', 'orders.view'],
};

export const auditLogs = [];

export function recordAudit({ action, entity, entityId, details, role = 'Admin', actor }) {
  const entry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    action,
    entity,
    entityId: entityId ? String(entityId) : '-',
    details,
    role,
    actor: actor || (role === 'Admin' ? 'Quản trị viên' : role),
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(entry);
  if (auditLogs.length > 100) auditLogs.pop();
  return entry;
}

export function can(role, permission) {
  return (rolePermissions[role] || []).includes(permission);
}
