import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useFetch } from '../hooks/useApi';
import { FormDialog } from '../components/FormDialog';

const columns = (onEdit: (order: any) => void): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'orderId', headerName: 'Mã đơn', width: 120 },
  { field: 'customer', headerName: 'Khách hàng', width: 150 },
  { field: 'product', headerName: 'Sản phẩm', width: 180 },
  {
    field: 'total',
    headerName: 'Tổng tiền',
    width: 100,
    valueFormatter: ({ value }) => {
      const amount = Number(value ?? 0);
      return Number.isNaN(amount) ? '-' : `$${amount.toFixed(2)}`;
    },
  },
  {
    field: 'status',
    headerName: 'Trạng thái',
    width: 120,
    renderCell: (params) => {
      const statusLabel =
        params.value === 'Delivered' ? 'Đã giao' :
        params.value === 'Shipped' ? 'Đang vận chuyển' :
        params.value === 'Processing' ? 'Đang xử lý' :
        params.value === 'Cancelled' ? 'Đã hủy' :
        params.value === 'Pending' ? 'Chờ xử lý' :
        params.value;
      return (
        <Chip
          label={statusLabel}
          color={
            params.value === 'Delivered' ? 'success' :
            params.value === 'Shipped' ? 'info' :
            params.value === 'Processing' ? 'warning' :
            params.value === 'Cancelled' ? 'error' :
            'default'
          }
          size="small"
          variant="outlined"
        />
      );
    },
  },
  { field: 'date', headerName: 'Ngày', width: 120 },
  {
    field: 'actions',
    headerName: 'Hành động',
    width: 100,
    sortable: false,
    renderCell: (params) => (
        <GridActionsCellItem icon={<EditIcon />} label="Sửa" onClick={() => onEdit(params.row)} />
    ),
  },
];

const formFields = [
  { name: 'status', label: 'Trạng thái', type: 'select' as const, options: [
    { label: 'Đang xử lý', value: 'Processing' },
    { label: 'Đã giao', value: 'Delivered' },
    { label: 'Đang vận chuyển', value: 'Shipped' },
    { label: 'Đã hủy', value: 'Cancelled' },
    { label: 'Chờ xử lý', value: 'Pending' },
  ], required: true },
];

const mapOrderStatusLabel = (status: string) =>
  status === 'Delivered' || status === 'Đã giao' ? 'Đã giao' :
  status === 'Shipped' || status === 'Đang vận chuyển' ? 'Đang vận chuyển' :
  status === 'Processing' || status === 'Đang xử lý' ? 'Đang xử lý' :
  status === 'Cancelled' || status === 'Đã hủy' ? 'Đã hủy' :
  status === 'Pending' || status === 'Chờ xử lý' ? 'Chờ xử lý' :
  status;

const normalizeOrderStatusValue = (status: string) =>
  status === 'Đã giao' ? 'Delivered' :
  status === 'Đang vận chuyển' ? 'Shipped' :
  status === 'Đang xử lý' ? 'Processing' :
  status === 'Đã hủy' ? 'Cancelled' :
  status === 'Chờ xử lý' ? 'Pending' :
  status;

export default function Orders() {
  const { data: orders, loading, error, refetch } = useFetch('/orders');
  const ordersData = orders ?? [];
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    let filtered = ordersData.filter((o) => {
      const matchSearch = o.customer.toLowerCase().includes(searchText.toLowerCase()) ||
                         o.orderId.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !statusFilter || normalizeOrderStatusValue(o.status) === statusFilter;
      const matchDate = (!fromDate || o.date >= fromDate) && (!toDate || o.date <= toDate);
      return matchSearch && matchStatus && matchDate;
    });
    setFilteredOrders(filtered);
  }, [ordersData, searchText, statusFilter, fromDate, toDate]);

  const handleSaveOrder = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/orders/${editingOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status }),
      });
      if (!response.ok) throw new Error('Cập nhật đơn hàng thất bại');
      await refetch();
      setSnackbar({ open: true, message: 'Cập nhật trạng thái đơn hàng thành công!', severity: 'success' });
      setDialogOpen(false);
      setEditingOrder(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const statusOptions = ['Processing', 'Delivered', 'Shipped', 'Cancelled', 'Pending'];

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
  };

  if (error) {
    return <Alert severity="error">Tải đơn hàng thất bại: {error}</Alert>;
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Đơn hàng
          </Typography>
          <Typography color="text.secondary">
            Quản lý trạng thái đơn hàng và lọc giao dịch theo khách hàng.
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="filled"
                placeholder="Tìm đơn hàng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                variant="filled"
                fullWidth
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}> {mapOrderStatusLabel(status)} </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                variant="filled"
                label="Từ"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                variant="filled"
                label="Đến"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleResetFilters}>
                Đặt lại
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ height: { xs: 520, md: 600 }, width: '100%' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={filteredOrders}
                columns={columns((order) => { setEditingOrder(order); setDialogOpen(true); })}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                sx={{ border: 0 }}
              />
            )}
          </Box>
        </Paper>

        <FormDialog
          open={dialogOpen}
          title="Cập nhật trạng thái đơn hàng"
          fields={formFields}
          initialValues={editingOrder ? { status: normalizeOrderStatusValue(editingOrder.status) } : {}}
          onSubmit={handleSaveOrder}
          onClose={() => { setDialogOpen(false); setEditingOrder(null); }}
          loading={formLoading}
        />

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
