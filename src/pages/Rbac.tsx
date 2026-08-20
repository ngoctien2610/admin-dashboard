import React from 'react';
import { Alert, Box, Chip, CircularProgress, FormControl, Grid, MenuItem, Paper, Select, Stack, Switch, Typography } from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { useRbac } from '../hooks/useRbac';

export default function Rbac() {
  const { role, setRole, data } = useRbac();
  if (!data) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><CircularProgress /></Box>;
  const groups = Array.from(new Set(data.permissions.map((permission) => permission.group)));
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}><Box><Typography variant="h4">RBAC & Permissions</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Kiểm soát quyền theo vai trò, minh bạch và dễ mở rộng.</Typography></Box><FormControl size="small" sx={{ minWidth: 180 }}><Select value={role} onChange={(event) => setRole(event.target.value)}>{Object.keys(data.roles).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Stack>
    <Alert icon={<AdminPanelSettingsRoundedIcon />} severity="info">Đang xem quyền của vai trò <strong>{role}</strong>. Vai trò được lưu trên thiết bị để mô phỏng phiên admin hiện tại.</Alert>
    <Grid container spacing={2}>{groups.map((group) => <Grid item xs={12} md={6} key={group}><Paper sx={{ p: 2.5, height: '100%' }}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}><Typography variant="h6">{group}</Typography><Chip label={`${data.permissions.filter((permission) => permission.group === group && data.roles[role].includes(permission.key)).length}/${data.permissions.filter((permission) => permission.group === group).length}`} color="primary" size="small" /></Stack>{data.permissions.filter((permission) => permission.group === group).map((permission) => <Stack direction="row" justifyContent="space-between" alignItems="center" key={permission.key} sx={{ py: 1, borderTop: 1, borderColor: 'divider' }}><Box><Typography variant="body2" fontWeight={700}>{permission.label}</Typography><Typography variant="caption" color="text.secondary">{permission.key}</Typography></Box><Switch checked={data.roles[role].includes(permission.key)} disabled /></Stack>)}</Paper></Grid>)}</Grid>
  </Box>;
}
