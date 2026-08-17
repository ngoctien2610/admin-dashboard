import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Product } from '../types';
import { fetchProductById } from '../services/api';

const mapCategoryLabel = (category: string) =>
  category === 'beauty' ? 'Làm đẹp' :
  category === 'electronics' ? 'Điện tử' :
  category === 'appliances' ? 'Đồ gia dụng' :
  category === 'groceries' ? 'Thực phẩm' :
  category === 'smartphones' ? 'Điện thoại thông minh' :
  category === 'laptops' ? 'Máy tính xách tay' :
  category === 'fragrances' ? 'Nước hoa' :
  category === 'skincare' ? 'Chăm sóc da' :
  category === 'home-decoration' ? 'Trang trí nhà' :
  category === 'furniture' ? 'Nội thất' :
  category === 'tops' ? 'Áo' :
  category === 'womens-dresses' ? 'Đầm nữ' :
  category === 'womens-shoes' ? 'Giày nữ' :
  category === 'mens-shirts' ? 'Áo nam' :
  category === 'mens-shoes' ? 'Giày nam' :
  category === 'mens-watches' ? 'Đồng hồ nam' :
  category === 'womens-watches' ? 'Đồng hồ nữ' :
  category === 'sunglasses' ? 'Kính mát' :
  category === 'automotive' ? 'Ô tô' :
  category === 'motorcycle' ? 'Xe máy' :
  category === 'lighting' ? 'Chiếu sáng' :
  category;

const mapStockStatusLabel = (status: string) =>
  status === 'In stock' || status === 'Còn hàng' ? 'Còn hàng' :
  status === 'Low stock' || status === 'Sắp hết' ? 'Sắp hết' :
  status === 'Out of stock' || status === 'Hết hàng' ? 'Hết hàng' :
  status;

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    fetchProductById(Number(productId))
      .then((data) => setProduct(data))
      .catch(() => setError('Không thể tải chi tiết sản phẩm.'))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Button startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }} onClick={() => navigate('/products')}>
        Quay lại danh sách sản phẩm
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : product ? (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h5">{product.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {product.category === 'beauty' ? 'Làm đẹp' : product.category === 'electronics' ? 'Điện tử' : product.category === 'appliances' ? 'Đồ gia dụng' : product.category === 'groceries' ? 'Thực phẩm' : product.category}
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  ${product.price}
                </Typography>
                <Chip
                  label={
                    product.status === 'In stock' || product.status === 'Còn hàng'
                      ? 'Còn hàng'
                      : product.status === 'Low stock' || product.status === 'Sắp hết'
                      ? 'Sắp hết'
                      : product.status === 'Out of stock' || product.status === 'Hết hàng'
                      ? 'Hết hàng'
                      : product.status
                  }
                  color={
                    product.status === 'In stock' || product.status === 'Còn hàng'
                      ? 'success'
                      : product.status === 'Low stock' || product.status === 'Sắp hết'
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  Thông tin chi tiết sản phẩm giúp bạn theo dõi tồn kho và quản lý giá bán hiệu quả.
                </Typography>
              </CardContent>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tóm tắt sản phẩm
              </Typography>
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                <Typography variant="body2">ID: {product.id}</Typography>
                <Typography variant="body2">Danh mục: {mapCategoryLabel(product.category)}</Typography>
                <Typography variant="body2">Giá: ${product.price}</Typography>
                <Typography variant="body2">Tồn kho: {product.stock}</Typography>
                <Typography variant="body2">Trạng thái: {mapStockStatusLabel(product.status)}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
