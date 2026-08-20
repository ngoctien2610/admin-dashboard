import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  React.useEffect(() => { fetch(`http://localhost:3002/api/orders/${orderId}`).then((response) => { if (!response.ok) throw new Error('Không thể tải đơn hàng'); return response.json(); }).then(setData).catch((reason: Error) => setError(reason.message)); }, [orderId]);
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><CircularProgress /></Box>;
  const statusColor = data.order.status === 'Delivered' ? 'success' : data.order.status === 'Cancelled' ? 'error' : 'warning';
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/orders')} sx={{ alignSelf: 'flex-start' }}>Quay lại đơn hàng</Button>
    <Paper sx={{ p: { xs: 2, md: 3 } }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Box><Typography variant="overline" color="primary.main">ORDER DETAIL</Typography><Typography variant="h4">{data.order.orderId}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{data.order.customer} • {data.order.date}</Typography></Box><Chip label={data.order.status} color={statusColor} /></Stack></Paper>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Paper sx={{ p: 3, flex: 1 }}><Typography variant="h6">Tóm tắt đơn hàng</Typography><Stack spacing={1.5} sx={{ mt: 2 }}><Typography>Khách hàng: {data.order.customer}</Typography><Typography>Sản phẩm: {data.order.product}</Typography><Typography>Tổng tiền: ${Number(data.order.total).toFixed(2)}</Typography><Typography>Ngày đặt: {data.order.date}</Typography></Stack></Paper><Paper sx={{ p: 3, flex: 2 }}><Stack direction="row" spacing={1} alignItems="center"><LocalShippingRoundedIcon color="primary" /><Typography variant="h6">Order Timeline</Typography></Stack><Stack spacing={2} sx={{ mt: 2 }}><Box sx={{ borderLeft: 3, borderColor: 'success.main', pl: 2 }}><Typography fontWeight={700}>Đơn hàng được tạo</Typography><Typography variant="caption" color="text.secondary">{data.order.date}</Typography></Box>{data.activity.map((entry: any) => <Box key={entry.id} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}><Typography fontWeight={700}>{entry.details}</Typography><Typography variant="caption" color="text.secondary">{new Date(entry.createdAt).toLocaleString('vi-VN')}</Typography></Box>)}</Stack></Paper></Stack>
  </Box>;
}
