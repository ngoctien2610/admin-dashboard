import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  React.useEffect(() => { fetch(`http://localhost:3002/api/users/${userId}`).then((response) => { if (!response.ok) throw new Error('Không thể tải người dùng'); return response.json(); }).then(setData).catch((reason: Error) => setError(reason.message)); }, [userId]);
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><CircularProgress /></Box>;
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/users')} sx={{ alignSelf: 'flex-start' }}>Quay lại người dùng</Button>
    <Paper sx={{ p: { xs: 2, md: 3 } }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}><Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>{data.user.name[0]}</Avatar><Box sx={{ flex: 1 }}><Typography variant="h4">{data.user.name}</Typography><Typography color="text.secondary">{data.user.email}</Typography></Box><Chip label={data.user.role} color="primary" variant="outlined" /><Chip label={data.user.status} color={data.user.status === 'Active' ? 'success' : 'warning'} /></Stack></Paper>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Paper sx={{ p: 3, flex: 1 }}><Typography variant="h6">Thông tin tài khoản</Typography><Stack spacing={1.5} sx={{ mt: 2 }}><Typography>ID: {data.user.id}</Typography><Typography>Vai trò: {data.user.role}</Typography><Typography>Đăng nhập cuối: {data.user.lastLogin}</Typography></Stack></Paper><Paper sx={{ p: 3, flex: 2 }}><Stack direction="row" spacing={1} alignItems="center"><TimelineRoundedIcon color="primary" /><Typography variant="h6">Activity Timeline</Typography></Stack>{data.activity.length === 0 ? <Typography color="text.secondary" sx={{ mt: 2 }}>Chưa có hoạt động được ghi nhận.</Typography> : <Stack spacing={2} sx={{ mt: 2 }}>{data.activity.map((entry: any) => <Box key={entry.id} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}><Typography fontWeight={700}>{entry.details}</Typography><Typography variant="caption" color="text.secondary">{new Date(entry.createdAt).toLocaleString('vi-VN')} • {entry.actor}</Typography></Box>)}</Stack>}</Paper></Stack>
  </Box>;
}
