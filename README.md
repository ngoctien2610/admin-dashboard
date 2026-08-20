# Admin Dashboard

A React + TypeScript + Material UI admin dashboard starter project.

## Features
- Dashboard with summary cards and chart
- Users, Products, Orders modules
- Search / filter in tables
- Popup form add/edit for users and products
- Real API create/update for users and products
- Product detail page with route `/products/:productId`
- Improved form validation on create/edit
- Dark mode toggle with smooth animation
- Responsive sidebar layout
- TypeScript type safety
- RBAC role matrix with route-level permission guards
- Audit log for user, product, and order mutations
- Realtime notifications through Socket.IO
- Advanced analytics with revenue, order status, inventory charts, and CSV export
- Global search with Ctrl/Cmd + K
- User detail with activity timeline
- Order detail with order timeline
- Advanced inventory dashboard with stock adjustments
- Excel import/export, file upload manager, system settings, and backup/restore
- AI Assistant workspace for admin operations
- JWT authentication with bcrypt password verification and protected API routes

## Install
```bash
npm install
```

## Run
```bash
npm run dev
```

In a second terminal, start the API and Socket.IO server:
```bash
cd server
npm start
```

The main additional routes are `/analytics`, `/audit-log`, `/rbac`, `/inventory`, and `/operations`. Detail routes are `/users/:userId` and `/orders/:orderId`. Login is required before accessing the dashboard; the API validates the JWT and checks permissions server-side. CRUD and inventory changes automatically appear in Audit Log and as realtime notifications.

Demo accounts:
- Admin: `admin@nexus.local` / `Admin@123`
- Manager: `manager@nexus.local` / `Manager@123`
- Support: `support@nexus.local` / `Support@123`
- Viewer: `viewer@nexus.local` / `Viewer@123`

Set `JWT_SECRET` in the server environment before production deployment. The default secret is only for local development.

Restart the API server after pulling backend changes so the new detail, inventory, and backup endpoints are loaded.

## Build
```bash
npm run build
```
