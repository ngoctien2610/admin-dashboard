import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useFetch } from "../hooks/useApi";
import { FormDialog, FormField } from "../components/FormDialog";
import { AiSearchBox } from "../components/AiSearchBox";
import { AiProductDescription } from "../components/AiProductDescription";

const mapStockStatusLabel = (status: string) =>
  status === "In stock" || status === "Còn hàng"
    ? "Còn hàng"
    : status === "Low stock" || status === "Sắp hết"
      ? "Sắp hết"
      : status === "Out of stock" || status === "Hết hàng"
        ? "Hết hàng"
        : status;

const normalizeStockStatusValue = (status: string) =>
  status === "Còn hàng"
    ? "In stock"
    : status === "Sắp hết"
      ? "Low stock"
      : status === "Hết hàng"
        ? "Out of stock"
        : status;

const mapCategoryLabel = (category: string) =>
  category === "beauty"
    ? "Làm đẹp"
    : category === "electronics"
      ? "Điện tử"
      : category === "appliances"
        ? "Đồ gia dụng"
        : category === "groceries"
          ? "Thực phẩm"
          : category === "smartphones"
            ? "Điện thoại thông minh"
            : category === "laptops"
              ? "Máy tính xách tay"
              : category === "fragrances"
                ? "Nước hoa"
                : category === "skincare"
                  ? "Chăm sóc da"
                  : category === "home-decoration"
                    ? "Trang trí nhà"
                    : category === "furniture"
                      ? "Nội thất"
                      : category === "tops"
                        ? "Áo"
                        : category === "womens-dresses"
                          ? "Đầm nữ"
                          : category === "womens-shoes"
                            ? "Giày nữ"
                            : category === "mens-shirts"
                              ? "Áo nam"
                              : category === "mens-shoes"
                                ? "Giày nam"
                                : category === "mens-watches"
                                  ? "Đồng hồ nam"
                                  : category === "womens-watches"
                                    ? "Đồng hồ nữ"
                                    : category === "sunglasses"
                                      ? "Kính mát"
                                      : category === "automotive"
                                        ? "Ô tô"
                                        : category === "motorcycle"
                                          ? "Xe máy"
                                          : category === "lighting"
                                            ? "Chiếu sáng"
                                            : category;

const columns = (
  onView: (id: number) => void,
  onEdit: (product: any) => void,
): GridColDef[] => [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Sản phẩm", width: 200 },
  {
    field: "category",
    headerName: "Danh mục",
    width: 120,
    renderCell: (params) => (
      <Typography>{mapCategoryLabel(params.value)}</Typography>
    ),
  },
  {
    field: "price",
    headerName: "Giá",
    width: 120,
    valueFormatter: ({ value }) => {
      const amount = Number(value ?? 0);
      return Number.isNaN(amount) ? "-" : `$${amount.toFixed(2)}`;
    },
  },
  { field: "stock", headerName: "Tồn kho", width: 100 },
  {
    field: "status",
    headerName: "Trạng thái",
    width: 120,
    renderCell: (params) => {
      const statusLabel = mapStockStatusLabel(params.value);
      return (
        <Chip
          label={statusLabel}
          color={
            params.value === "In stock" || params.value === "Còn hàng"
              ? "success"
              : params.value === "Low stock" || params.value === "Sắp hết"
                ? "warning"
                : "error"
          }
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: "actions",
    headerName: "Hành động",
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Xem"
          onClick={() => onView(params.row.id)}
        />
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Sửa"
          onClick={() => onEdit(params.row)}
        />
      </Box>
    ),
  },
];

const formFields: FormField[] = [
  { name: "name", label: "Tên sản phẩm", required: true },
  {
    name: "category",
    label: "Danh mục",
    type: "select" as const,
    options: [
      { label: "Làm đẹp", value: "beauty" },
      { label: "Điện tử", value: "electronics" },
      { label: "Đồ gia dụng", value: "appliances" },
      { label: "Thực phẩm", value: "groceries" },
    ],
    required: true,
  },
  { name: "price", label: "Giá", type: "number", required: true },
];

export default function Products() {
  const navigate = useNavigate();
  const {
    data: products,
    loading,
    error,
    refetch,
  } = useFetch<any[]>("/products");
  const productsData = products ?? [];
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const filtered = productsData.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchStatus =
        !statusFilter ||
        mapStockStatusLabel(p.status) === mapStockStatusLabel(statusFilter);
      return matchSearch && matchCategory && matchStatus;
    });
    setFilteredProducts(filtered);
  }, [productsData, searchText, categoryFilter, statusFilter]);

  const handleSaveProduct = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
      };
      const response = await fetch(
        `http://localhost:3002/api/products${editingProduct ? `/${editingProduct.id}` : ""}`,
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Lưu sản phẩm thất bại");
      await refetch();
      setSnackbar({
        open: true,
        message: editingProduct
          ? "Cập nhật sản phẩm thành công!"
          : "Tạo sản phẩm thành công!",
        severity: "success",
      });
      setDialogOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const categoryOptions = Array.from(
    new Set(productsData.map((p) => p.category)),
  ).sort();
  const statusOptions = ["In stock", "Low stock", "Out of stock"];

  if (error) {
    return <Alert severity="error">Tải sản phẩm thất bại: {error}</Alert>;
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Sản phẩm
          </Typography>
          <Typography color="text.secondary">
            Duyệt, chỉnh sửa và xem trước sản phẩm bằng bảng quản lý nhẹ nhàng.
          </Typography>
        </Box>

        <AiSearchBox
          value={searchText}
          onChange={setSearchText}
          type="all"
          label="Tìm kiếm thông minh cho người dùng, sản phẩm và đơn hàng"
          placeholder="Nhập từ khóa để nhận đề xuất AI..."
        />

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="filled"
                placeholder="Tìm sản phẩm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                select
                variant="filled"
                fullWidth
                label="Danh mục"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {mapCategoryLabel(cat)}
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
                    {mapStockStatusLabel(status)}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingProduct(null);
                  setDialogOpen(true);
                }}
              >
                Thêm sản phẩm
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <AiProductDescription />

        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ height: { xs: 520, md: 600 }, width: "100%" }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={filteredProducts}
                columns={columns(
                  (id) => navigate(`/products/${id}`),
                  (product) => {
                    setEditingProduct(product);
                    setDialogOpen(true);
                  },
                )}
                pageSizeOptions={[5, 10]}
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 5 } },
                }}
                sx={{ border: 0 }}
              />
            )}
          </Box>
        </Paper>

        <FormDialog
          open={dialogOpen}
          title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
          fields={formFields}
          initialValues={
            editingProduct
              ? {
                  ...editingProduct,
                  price: String(editingProduct.price),
                }
              : {}
          }
          onSubmit={handleSaveProduct}
          onClose={() => {
            setDialogOpen(false);
            setEditingProduct(null);
          }}
          loading={formLoading}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
