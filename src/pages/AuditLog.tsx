import React from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface AuditEntry {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  role: string;
  actor: string;
  createdAt: string;
}

export default function AuditLog() {
  const [logs, setLogs] = React.useState<AuditEntry[]>([]);
  const [filter, setFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch("http://localhost:3002/api/audit-logs")
      .then((response) => response.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);
  const filtered =
    filter === "all" ? logs : logs.filter((log) => log.entity === filter);
  const columns: GridColDef[] = [
    {
      field: "createdAt",
      headerName: "Thời gian",
      width: 190,
      valueGetter: (params) => new Date(params.value).toLocaleString("vi-VN"),
    },
    { field: "action", headerName: "Thao tác", width: 120 },
    {
      field: "entity",
      headerName: "Đối tượng",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={`${params.value} #${params.row.entityId}`}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: "details", headerName: "Chi tiết", flex: 1, minWidth: 260 },
    { field: "actor", headerName: "Người thực hiện", width: 160 },
  ];
  if (loading)
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4">Audit Log</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Lịch sử thao tác quản trị được ghi nhận tự động để kiểm tra và truy
          vết.
        </Typography>
      </Box>
      <Alert icon={<SecurityRoundedIcon />} severity="info">
        Mỗi thay đổi user, sản phẩm và trạng thái đơn hàng đều tạo một bản ghi
        audit.
      </Alert>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Hoạt động gần đây</Typography>
          <TextField
            select
            size="small"
            label="Lọc đối tượng"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="User">Người dùng</MenuItem>
            <MenuItem value="Product">Sản phẩm</MenuItem>
            <MenuItem value="Order">Đơn hàng</MenuItem>
          </TextField>
        </Stack>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
