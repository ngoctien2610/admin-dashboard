import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useFetch } from "../hooks/useApi";
import { FormDialog, FormField } from "../components/FormDialog";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 180 },
  { field: "email", headerName: "Email", width: 220 },
  { field: "role", headerName: "Role", width: 140 },
  { field: "status", headerName: "Status", width: 130 },
  { field: "lastLogin", headerName: "Last Login", width: 140 },
];

const formFields: FormField[] = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email" as const, required: true },
  {
    name: "role",
    label: "Role",
    type: "select" as const,
    options: [
      { label: "Admin", value: "Admin" },
      { label: "User", value: "User" },
      { label: "Manager", value: "Manager" },
    ],
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
    required: true,
  },
  { name: "lastLogin", label: "Last Login", type: "text", required: true },
];

export default function Users() {
  const {
    data: usersData,
    loading,
    error,
    refetch,
  } = useFetch<any[]>("/users");
  const users = usersData ?? [];
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
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
    const filtered = users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase());
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus = !statusFilter || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
    setFilteredUsers(filtered);
  }, [users, searchText, roleFilter, statusFilter]);

  const handleSaveUser = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/users${editingUser ? `/${editingUser.id}` : ""}`,
        {
          method: editingUser ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) throw new Error("Failed to save");
      await refetch();
      setSnackbar({
        open: true,
        message: editingUser ? "User updated!" : "User created!",
        severity: "success",
      });
      setDialogOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const roleOptions = Array.from(new Set(users.map((u) => u.role))).sort();
  const statusOptions = Array.from(new Set(users.map((u) => u.status))).sort();

  if (error) {
    return <Alert severity="error">Failed to load users: {error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search users..."
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
            fullWidth
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
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
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          md={2}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingUser(null);
              setDialogOpen(true);
            }}
          >
            Add user
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ height: 560, width: "100%" }}>
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
            rows={filteredUsers}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 5 } },
            }}
            onRowDoubleClick={(params) => {
              setEditingUser(params.row);
              setDialogOpen(true);
            }}
          />
        )}
      </Box>

      <FormDialog
        open={dialogOpen}
        title={editingUser ? "Edit User" : "Add User"}
        fields={formFields}
        initialValues={editingUser || {}}
        onSubmit={handleSaveUser}
        onClose={() => {
          setDialogOpen(false);
          setEditingUser(null);
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
  );
}
