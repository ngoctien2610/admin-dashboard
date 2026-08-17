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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useFetch } from '../hooks/useApi';
import { FormDialog } from '../components/FormDialog';

const mapRoleLabel = (role: string) =>
  role === 'Admin' || role === 'Quản trị viên' ? 'Quản trị viên' :
  role === 'User' || role === 'Người dùng' ? 'Người dùng' :
  role === 'Manager' || role === 'Quản lý' ? 'Quản lý' :
  role === 'Support' || role === 'Hỗ trợ' ? 'Hỗ trợ' :
  role === 'Editor' || role === 'Biên tập viên' ? 'Biên tập viên' :
  role;

const mapStatusLabel = (status: string) =>
  status === 'Active' || status === 'Hoạt động' ? 'Hoạt động' :
  status === 'Inactive' || status === 'Không hoạt động' ? 'Không hoạt động' :
  status === 'Pending' || status === 'Chờ xử lý' ? 'Chờ xử lý' :
  status;

const normalizeRoleValue = (role: string) =>
  role === 'Quản trị viên' ? 'Admin' :
  role === 'Người dùng' ? 'User' :
  role === 'Quản lý' ? 'Manager' :
  role === 'Hỗ trợ' ? 'Support' :
  role === 'Biên tập viên' ? 'Editor' :
  role;

const normalizeStatusValue = (status: string) =>
  status === 'Hoạt động' ? 'Active' :
  status === 'Không hoạt động' ? 'Inactive' :
  status === 'Chờ xử lý' ? 'Pending' :
  status;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Họ tên', width: 180 },
  { field: 'email', headerName: 'Email', width: 220 },
  {
    field: 'role',
    headerName: 'Vai trò',
    width: 140,
    renderCell: (params) => {
      return <Typography>{mapRoleLabel(params.value)}</Typography>;
    },
  },
  {
    field: 'status',
    headerName: 'Trạng thái',
    width: 130,
    renderCell: (params) => {
      const statusLabel = mapStatusLabel(params.value);
      return (
        <Chip
          label={statusLabel}
          color={
            params.value === 'Active' || params.value === 'Hoạt động' ? 'success' :
            params.value === 'Inactive' || params.value === 'Không hoạt động' ? 'warning' :
            'default'
          }
          size="small"
          variant="outlined"
        />
      );
    },
  },
  { field: 'lastLogin', headerName: 'Đăng nhập cuối', width: 140 },
];

const formFields = [
  { name: 'name', label: 'Họ tên', required: true },
  { name: 'email', label: 'Email', type: 'email' as const, required: true },
  { name: 'role', label: 'Vai trò', type: 'select' as const, options: [
    { label: 'Quản trị viên', value: 'Admin' },
    { label: 'Người dùng', value: 'User' },
    { label: 'Quản lý', value: 'Manager' },
    { label: 'Hỗ trợ', value: 'Support' },
    { label: 'Biên tập viên', value: 'Editor' },
  ], required: true },
  { name: 'status', label: 'Trạng thái', type: 'select' as const, options: [
    { label: 'Hoạt động', value: 'Active' },
    { label: 'Không hoạt động', value: 'Inactive' },
    { label: 'Chờ xử lý', value: 'Pending' },
  ], required: true },
  { name: 'lastLogin', label: 'Đăng nhập cuối', type: 'text', required: true },
];

export default function Users() {
  const { data: users, loading, error, refetch } = useFetch('/users');
  const usersData = users ?? [];
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const filtered = usersData.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchText.toLowerCase());
      const matchRole = !roleFilter || mapRoleLabel(u.role) === mapRoleLabel(roleFilter);
      const matchStatus = !statusFilter || mapStatusLabel(u.status) === mapStatusLabel(statusFilter);
      return matchSearch && matchRole && matchStatus;
    });
    setFilteredUsers(filtered);
  }, [usersData, searchText, roleFilter, statusFilter]);

  const handleSaveUser = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/users${editingUser ? `/${editingUser.id}` : ''}`, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Lưu người dùng thất bại');
      await refetch();
      setSnackbar({ open: true, message: editingUser ? 'Cập nhật người dùng thành công!' : 'Thêm người dùng thành công!', severity: 'success' });
      setDialogOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const roleOptions = ['Admin', 'User', 'Manager', 'Support', 'Editor'];
  const statusOptions = ['Active', 'Inactive', 'Pending'];

  if (error) {
    return <Alert severity="error">Tải người dùng thất bại: {error}</Alert>;
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Quản lý người dùng
          </Typography>
          <Typography color="text.secondary">
            Tìm kiếm, lọc và quản lý người dùng với giao diện phản hồi nhanh.
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="filled"
                placeholder="Tìm người dùng..."
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
                variant="filled"
                fullWidth
                label="Vai trò"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {mapRoleLabel(role)}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
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
                  <option key={status} value={status}>
                    {mapStatusLabel(status)}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingUser(null); setDialogOpen(true); }}>
                Thêm người dùng
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
                rows={filteredUsers}
                columns={columns}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                onRowDoubleClick={(params) => {
                  setEditingUser(params.row);
                  setDialogOpen(true);
                }}
                sx={{ border: 0 }}
              />
            )}
          </Box>
        </Paper>

        <FormDialog
          open={dialogOpen}
          title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
          fields={formFields}
          initialValues={editingUser ? {
            ...editingUser,
            role: normalizeRoleValue(editingUser.role),
            status: normalizeStatusValue(editingUser.status),
          } : {}}
          onSubmit={handleSaveUser}
          onClose={() => { setDialogOpen(false); setEditingUser(null); }}
          loading={formLoading}
        />

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
