import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useFetch } from '../hooks/useApi';
import { FormDialog, FormField } from '../components/FormDialog';

const columns = (onView: (id: number) => void, onEdit: (product: any) => void): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Product', width: 200 },
  { field: 'category', headerName: 'Category', width: 120 },
  { field: 'price', headerName: 'Price', width: 100, valueGetter: (params) => typeof params.value === 'number' ? `$${params.value.toFixed(2)}` : '' },
  { field: 'stock', headerName: 'Stock', width: 100 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={params.value === 'In stock' ? 'success' : params.value === 'Low stock' ? 'warning' : 'error'}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridActionsCellItem icon={<VisibilityIcon />} label="View" onClick={() => onView(params.row.id)} />
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => onEdit(params.row)} />
      </Box>
    ),
  },
];

const formFields: FormField[] = [
  { name: 'name', label: 'Product Name', required: true },
  { name: 'category', label: 'Category', type: 'select' as const, options: [
    { label: 'beauty', value: 'beauty' },
    { label: 'electronics', value: 'electronics' },
    { label: 'appliances', value: 'appliances' },
    { label: 'groceries', value: 'groceries' },
  ], required: true },
  { name: 'price', label: 'Price', type: 'number', required: true },
  { name: 'stock', label: 'Stock', type: 'number', required: true },
  { name: 'status', label: 'Status', type: 'select' as const, options: [
    { label: 'In stock', value: 'In stock' },
    { label: 'Low stock', value: 'Low stock' },
    { label: 'Out of stock', value: 'Out of stock' },
  ], required: true },
];

export default function Products() {
  const navigate = useNavigate();
  const { data: productsData, loading, error, refetch } = useFetch<any[]>('/products');
  const products = productsData ?? [];
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
    setFilteredProducts(filtered);
  }, [products, searchText, categoryFilter, statusFilter]);

  const handleSaveProduct = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
      };
      const response = await fetch(`http://localhost:3001/api/products${editingProduct ? `/${editingProduct.id}` : ''}`, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save product');
      await refetch();
      setSnackbar({ open: true, message: editingProduct ? 'Product updated!' : 'Product created!', severity: 'success' });
      setDialogOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const categoryOptions = Array.from(new Set(products.map(p => p.category))).sort();
  const statusOptions = ['In stock', 'Low stock', 'Out of stock'];

  if (error) {
    return <Alert severity="error">Failed to load products: {error}</Alert>;
  }

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" gutterBottom>Products</Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
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
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingProduct(null); setDialogOpen(true); }}>
              Add product
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
              rows={filteredProducts}
              columns={columns(
                (id) => navigate(`/products/${id}`),
                (product) => { setEditingProduct(product); setDialogOpen(true); }
              )}
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
            />
          )}
        </Box>

        <FormDialog
          open={dialogOpen}
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          fields={formFields}
          initialValues={editingProduct ? { ...editingProduct, price: String(editingProduct.price), stock: String(editingProduct.stock) } : {}}
          onSubmit={handleSaveProduct}
          onClose={() => { setDialogOpen(false); setEditingProduct(null); }}
          loading={formLoading}
        />

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
