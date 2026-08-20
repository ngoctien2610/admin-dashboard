import React from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useNavigate } from 'react-router-dom';
import { useRbac } from '../hooks/useRbac';
import { useAuth } from '../auth/AuthContext';

interface PermissionGateProps { permission: string; children: React.ReactNode }

export default function PermissionGate({ permission, children }: PermissionGateProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can, data, loading, role } = useRbac(user?.role);
  if (loading) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 220 }}><CircularProgress /></Box>;
  if (!can(permission)) return <Paper sx={{ p: { xs: 3, md: 5 }, minHeight: 320, display: 'grid', placeItems: 'center', textAlign: 'center' }}><Stack alignItems="center" spacing={1.5}><LockRoundedIcon color="warning" sx={{ fontSize: 52 }} /><Typography variant="h5">Bạn không có quyền truy cập</Typography><Typography color="text.secondary">Vai trò <strong>{role}</strong> không được cấp quyền <strong>{permission}</strong> cho trang này.</Typography><Alert severity="warning" sx={{ mt: 1 }}>Vui lòng liên hệ quản trị viên nếu bạn cần quyền bổ sung.</Alert><Button variant="contained" onClick={() => navigate('/')}>Quay về tổng quan</Button></Stack></Paper>;
  return <>{children}</>;
}
