import React, { useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { Box, CircularProgress, Alert, Paper } from '@mui/material';

interface DataTableProps {
  columns: GridColDef[];
  rows: any[];
  loading?: boolean;
  error?: string;
  pageable?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  error,
  pageable = true,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 5,
    page: 0,
  });

  if (error) {
    return <Alert severity="error">Lỗi: {error}</Alert>;
  }

  return (
    <Paper elevation={2} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 420, p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 420, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            disableSelectionOnClick
            sx={{ border: 0 }}
          />
        </Box>
      )}
    </Paper>
  );
};
