import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import TableViewRoundedIcon from "@mui/icons-material/TableViewRounded";
import { utils, writeFile, read } from "xlsx";
import { AiChatBox } from "../components/AiChatBox";

export default function Operations() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [message, setMessage] = React.useState("");
  const [compact, setCompact] = React.useState(
    () => window.localStorage.getItem("compactMode") === "true",
  );
  const [autoRefresh, setAutoRefresh] = React.useState(
    () => window.localStorage.getItem("autoRefresh") !== "false",
  );

  const exportExcel = async () => {
    const products = await fetch("http://localhost:3002/api/products").then(
      (response) => response.json(),
    );
    const workbook = utils.book_new();
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet(products),
      "Products",
    );
    writeFile(workbook, "products-export.xlsx");
    setMessage("Đã xuất danh sách sản phẩm");
  };
  const importExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const workbook = read(event.target?.result as ArrayBuffer);
      const rows = utils.sheet_to_json<Record<string, any>>(
        workbook.Sheets[workbook.SheetNames[0]],
      );
      let imported = 0;
      for (const row of rows) {
        if (!row.name) continue;
        await fetch("http://localhost:3002/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row.name,
            category: row.category || "general",
            price: Number(row.price) || 0,
            stock: Number(row.stock) || 0,
            status: Number(row.stock) > 0 ? "In stock" : "Out of stock",
          }),
        });
        imported += 1;
      }
      setMessage(`Đã nhập ${imported} sản phẩm`);
    };
    reader.readAsArrayBuffer(file);
  };
  const downloadBackup = async () => {
    const data = await fetch("http://localhost:3002/api/backup").then(
      (response) => response.json(),
    );
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nexus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage("Đã tạo bản backup");
  };
  const restoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = await fetch("http://localhost:3002/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: event.target?.result,
      });
      if (!result.ok) {
        setMessage("File backup không hợp lệ");
        return;
      }
      setMessage("Đã khôi phục dữ liệu");
    };
    reader.readAsText(file);
  };
  const saveSetting = (key: string, value: boolean) => {
    window.localStorage.setItem(key, String(value));
    if (key === "compactMode") setCompact(value);
    else setAutoRefresh(value);
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4">Operations Hub</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Công cụ dữ liệu, cấu hình hệ thống và trợ lý AI cho admin.
        </Typography>
      </Box>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <TableViewRoundedIcon color="primary" />
                <Typography variant="h6">Import / Export Excel</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Xuất sản phẩm ra Excel hoặc nhập file có các cột name, category,
                price, stock.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={exportExcel}
                >
                  Xuất Excel
                </Button>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadRoundedIcon />}
                >
                  Nhập Excel
                  <input
                    hidden
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(event) =>
                      event.target.files?.[0] &&
                      importExcel(event.target.files[0])
                    }
                  />
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Backup / Restore</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Snapshot toàn bộ users, products và orders dưới dạng JSON.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={downloadBackup}
                >
                  Tải backup
                </Button>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<RestoreRoundedIcon />}
                >
                  Restore
                  <input
                    hidden
                    type="file"
                    accept=".json"
                    onChange={(event) =>
                      event.target.files?.[0] &&
                      restoreBackup(event.target.files[0])
                    }
                  />
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">System Settings</Typography>
            <List disablePadding>
              <ListItem divider>
                <ListItemText
                  primary="Giao diện compact"
                  secondary="Giảm khoảng cách giữa các vùng dữ liệu"
                />
                <Switch
                  checked={compact}
                  onChange={(event) =>
                    saveSetting("compactMode", event.target.checked)
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Tự động cập nhật"
                  secondary="Cho phép các widget tải lại dữ liệu"
                />
                <Switch
                  checked={autoRefresh}
                  onChange={(event) =>
                    saveSetting("autoRefresh", event.target.checked)
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">File / Image Upload Manager</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Quản lý file tạm trong phiên hiện tại trước khi nối storage
              production.
            </Typography>
            <Button
              component="label"
              sx={{ mt: 2 }}
              variant="outlined"
              startIcon={<CloudUploadRoundedIcon />}
            >
              Chọn file
              <input
                hidden
                multiple
                type="file"
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []))
                }
              />
            </Button>
            {files.length > 0 && (
              <List dense>
                {files.map((file) => (
                  <ListItem key={`${file.name}-${file.size}`}>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Divider />
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          AI Assistant cho Admin
        </Typography>
        <AiChatBox />
      </Box>
      {message && (
        <Alert severity="success" onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}
    </Box>
  );
}
