import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';

interface ProductDescriptionInput {
  name: string;
  category: string;
  price: string;
  stock: string;
}

export const AiProductDescription: React.FC = () => {
  const [product, setProduct] = useState<ProductDescriptionInput>({
    name: '',
    category: '',
    price: '',
    stock: '',
  });
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!product.name || !product.category) {
      setError('Vui lòng nhập tên sản phẩm và danh mục.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3002/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: { ...product, price: Number(product.price), stock: Number(product.stock) } }),
      });
      if (!res.ok) throw new Error(`Lỗi tạo mô tả: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo mô tả.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Tạo mô tả sản phẩm AI
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Nhập dữ liệu ngắn và nhận tiêu đề cùng mô tả chuẩn hóa.
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Tên sản phẩm"
          variant="filled"
          fullWidth
          value={product.name}
          onChange={(e) => setProduct((prev) => ({ ...prev, name: e.target.value }))}
        />
        <TextField
          label="Danh mục"
          variant="filled"
          fullWidth
          value={product.category}
          onChange={(e) => setProduct((prev) => ({ ...prev, category: e.target.value }))}
        />
        <TextField
          label="Giá"
          variant="filled"
          fullWidth
          value={product.price}
          onChange={(e) => setProduct((prev) => ({ ...prev, price: e.target.value }))}
        />
        <TextField
          label="Tồn kho"
          variant="filled"
          fullWidth
          value={product.stock}
          onChange={(e) => setProduct((prev) => ({ ...prev, stock: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="contained" onClick={handleGenerate} disabled={loading}>
            Tạo mô tả
          </Button>
          {loading && <CircularProgress size={24} />}
        </Box>
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {result && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2">Tiêu đề</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {result.title}
            </Typography>
            <Typography variant="subtitle2">Mô tả</Typography>
            <Typography variant="body2">{result.description}</Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
