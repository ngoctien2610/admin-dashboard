import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Avatar, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useAuth } from '../auth/AuthContext';

const demoAccounts = [
  { label: 'Admin', email: 'admin@nexus.local', password: 'Admin@123' },
  { label: 'Manager', email: 'manager@nexus.local', password: 'Manager@123' },
  { label: 'Support', email: 'support@nexus.local', password: 'Support@123' },
  { label: 'Viewer', email: 'viewer@nexus.local', password: 'Viewer@123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('admin@nexus.local');
  const [password, setPassword] = React.useState('Admin@123');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setLoading(true); setError(''); try { await login(email, password); navigate('/', { replace: true }); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Đăng nhập thất bại'); } finally { setLoading(false); } };
  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}><Container maxWidth="sm"><Paper sx={{ p: { xs: 3, sm: 5 } }}><Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}><Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}><LockRoundedIcon /></Avatar><Typography variant="h4">Nexus Admin</Typography><Typography color="text.secondary">Đăng nhập vào workspace quản trị</Typography></Stack>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Box component="form" onSubmit={submit}><Stack spacing={2}><TextField label="Email" type="email" fullWidth value={email} onChange={(event) => setEmail(event.target.value)} required /><TextField label="Mật khẩu" type="password" fullWidth value={password} onChange={(event) => setPassword(event.target.value)} required /><Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? <CircularProgress size={22} color="inherit" /> : 'Đăng nhập'}</Button></Stack></Box><Typography variant="subtitle2" sx={{ mt: 4, mb: 1 }}>Tài khoản demo</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{demoAccounts.map((account) => <Button key={account.label} size="small" variant="outlined" onClick={() => { setEmail(account.email); setPassword(account.password); }}>{account.label}</Button>)}</Stack><Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>Các tài khoản demo dùng để kiểm tra RBAC. Production nên thay bằng database và secret qua biến môi trường.</Typography></Paper></Container></Box>;
}
