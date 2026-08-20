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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useFetch } from '../hooks/useApi';
import { FormDialog, FormField } from '../components/FormDialog';

const columns = (onEdit: (order: any) => void): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'orderId', headerName: 'Order ID', width: 120 },
  { field: 'customer', headerName: 'Customer', width: 150 },
  { field: 'product', headerName: 'Product', width: 180 },
  { field: 'total', headerName: 'Total', width: 100, valueGetter: (params) => typeof params.value === 'number' ? `$${params.value.toFixed(2)}` : '' },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={
          params.value === 'Delivered' ? 'success' :
          params.value === 'Shipped' ? 'info' :
          params.value === 'Processing' ? 'warning' : 'default'
        }
        size="small"
        variant="outlined"
      />
    ),
  },
  { field: 'date', headerName: 'Date', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    sortable: false,
    renderCell: (params) => (
      <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => onEdit(params.row)} />
    ),
  },
];

const formFields: FormField[] = [
  { name: 'status', label: 'Status', type: 'select' as const, options: [
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ], required: true },
];

export default function Orders() {
  const { data: ordersData, loading, error, refetch } = useFetch<any[]>('/orders');
  const orders = ordersData ?? [];
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
    let filtered = orders.filter(o => {
      const matchSearch = o.customer.toLowerCase().includes(searchText.toLowerCase()) ||
                         o.orderId.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !statusFilter || o.status === statusFilter;
      const matchDate = (!fromDate || o.date >= fromDate) && (!toDate || o.date <= toDate);
      return matchSearch && matchStatus && matchDate;
    });
    setFilteredOrders(filtered);
  }, [orders, searchText, statusFilter, fromDate, toDate]);

  const handleSaveOrder = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${editingOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      await refetch();
      setSnackbar({ open: true, message: 'Order status updated!', severity: 'success' });
      setDialogOpen(false);
      setEditingOrder(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const statusOptions = Array.from(new Set(orders.map(o => o.status))).sort();

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
  };

  if (error) {
    return <Alert severity="error">Failed to load orders: {error}</Alert>;
  }

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" gutterBottom>Orders</Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search orders..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleResetFilters}>
              Reset
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ height: 560, width: '100%' }}>
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
            />
          )}
        </Box>

        <FormDialog
          open={dialogOpen}
          title="Update Order Status"
          fields={formFields}
          initialValues={editingOrder ? { status: editingOrder.status } : {}}
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
