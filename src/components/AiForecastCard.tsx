import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
} from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ForecastData {
  revenueTrend: Array<{ name: string; revenue: number; prediction: number }>;
  lowStock: Array<{ id: number; name: string; stock: number; alert: string }>;
  slowMovers: Array<{ name: string; stock: number }>;
  summary: string;
}

export const AiForecastCard: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadForecast = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3002/api/ai/forecast');
        if (!res.ok) throw new Error(`Lỗi tải dự báo: ${res.status}`);
        const data = await res.json();
        setForecast(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải dự báo');
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Dự báo & Cảnh báo kho
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Xem dự báo doanh số và sản phẩm cần ưu tiên bổ sung.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : forecast ? (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {forecast.summary}
          </Typography>

          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast.revenueTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="prediction" stroke="#4f46e5" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Kho thấp
                </Typography>
                {forecast.lowStock.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Không có sản phẩm tồn kho thấp.
                  </Typography>
                ) : (
                  forecast.lowStock.map((product) => (
                    <Typography key={product.id} variant="body2">
                      {product.name} ({product.stock})
                    </Typography>
                  ))
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Hàng chậm
                </Typography>
                {forecast.slowMovers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Không có sản phẩm chậm.
                  </Typography>
                ) : (
                  forecast.slowMovers.map((item) => (
                    <Typography key={item.name} variant="body2">
                      {item.name} ({item.stock})
                    </Typography>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : null}
    </Paper>
  );
};
