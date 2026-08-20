import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormDialog, FormField } from '../components/FormDialog';

const adjustmentFields: FormField[] = [
  { name: 'type', label: 'Loại điều chỉnh', type: 'select', options: [{ label: 'Nhập kho', value: 'in' }, { label: 'Xuất kho', value: 'out' }, { label: 'Điều chỉnh giảm', value: 'adjust-down' }, { label: 'Điều chỉnh tăng', value: 'adjust-up' }], required: true },
  { name: 'quantity', label: 'Số lượng', type: 'number', required: true },
  { name: 'reason', label: 'Lý do', required: true },
];

export default function Inventory() {
  const [data, setData] = React.useState<any>(null);
  const [threshold, setThreshold] = React.useState(20);
  const [message, setMessage] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [defaultAdjustmentType, setDefaultAdjustmentType] = React.useState('in');
  const [saving, setSaving] = React.useState(false);
  const load = React.useCallback(() => fetch(`http://localhost:3002/api/inventory/summary?threshold=${threshold}`).then((response) => response.json()).then(setData), [threshold]);
  React.useEffect(() => { load(); }, [load]);
  const adjust = async (data: Record<string, string>) => {
    const amount = Number(data.quantity);
    const quantity = data.type === 'out' || data.type === 'adjust-down' ? -amount : amount;
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3002/api/inventory/${selectedProduct.id}/adjust`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity, reason: data.reason }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Không thể điều chỉnh tồn kho');
      setMessage('Đã cập nhật tồn kho và ghi audit log'); setDialogOpen(false); load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể điều chỉnh tồn kho'); } finally { setSaving(false); }
  };
  if (!data) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><CircularProgress /></Box>;
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Sản phẩm', flex: 1, minWidth: 220 },
    { field: 'category', headerName: 'Danh mục', width: 140 },
    { field: 'stock', headerName: 'Số lượng', width: 110 },
    { field: 'inventoryValue', headerName: 'Giá trị kho', width: 140, valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}` },
    { field: 'risk', headerName: 'Rủi ro', width: 120, renderCell: (params) => <Chip size="small" label={params.value} color={params.value === 'Healthy' ? 'success' : params.value === 'Warning' ? 'warning' : 'error'} /> },
    { field: 'actions', headerName: 'Điều chỉnh', width: 150, sortable: false, renderCell: (params) => <Stack direction="row"><Button aria-label="Giảm tồn kho" onClick={() => { setSelectedProduct(params.row); setDefaultAdjustmentType('out'); setDialogOpen(true); }}><RemoveRoundedIcon /></Button><Button aria-label="Tăng tồn kho" onClick={() => { setSelectedProduct(params.row); setDefaultAdjustmentType('in'); setDialogOpen(true); }}><AddRoundedIcon /></Button></Stack> },
  ];
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}><Box><Typography variant="h4">Advanced Inventory</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Theo dõi giá trị tồn kho, điểm đặt hàng và rủi ro thiếu hàng.</Typography></Box><TextField label="Ngưỡng cảnh báo" type="number" size="small" value={threshold} onChange={(event) => setThreshold(Number(event.target.value) || 0)} /></Stack>
    <Grid container spacing={2}>{[['Tổng đơn vị', data.totals.units], ['Giá trị tồn kho', `$${data.totals.value.toLocaleString()}`], ['Cần nhập hàng', data.totals.warning], ['Hết hàng', data.totals.critical]].map(([label, value]) => <Grid item xs={6} md={3} key={String(label)}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt: 1 }}>{value}</Typography></CardContent></Card></Grid>)}</Grid>
    <Alert icon={<InventoryRoundedIcon />} severity="info">Điều chỉnh tồn kho sẽ tạo audit log và thông báo realtime cho các admin đang online.</Alert>
    <Paper sx={{ p: 2 }}><Box sx={{ height: 560 }}><DataGrid rows={data.items} columns={columns} pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} /></Box></Paper>
    <FormDialog open={dialogOpen} title={`Điều chỉnh tồn kho: ${selectedProduct?.name || ''}`} fields={adjustmentFields} initialValues={{ type: defaultAdjustmentType }} onSubmit={adjust} onClose={() => setDialogOpen(false)} loading={saving} />
    <Snackbar open={Boolean(message)} autoHideDuration={2500} onClose={() => setMessage('')} message={message} />
  </Box>;
}
