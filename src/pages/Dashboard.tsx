import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Paper, Chip, useTheme } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardMetrics, ordersChartData } from '../data/mockData';
import { AiForecastCard } from '../components/AiForecastCard';
import { AiChatBox } from '../components/AiChatBox';

export default function Dashboard() {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Chào mừng quay lại, quản trị viên
        </Typography>
        <Typography color="text.secondary">
          Truy cập số liệu sức khỏe hệ thống và doanh số mới nhất trên một bảng điều khiển hiện đại.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {dashboardMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Paper elevation={3} sx={{ p: 3, minHeight: 150, borderRadius: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {metric.label}
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {metric.value}
              </Typography>
              <Chip
                label={metric.caption}
                size="small"
                color={index === 3 ? 'secondary' : 'primary'}
                variant="outlined"
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Đơn hàng hàng tuần
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Theo dõi số đơn hàng trong tuần để điều chỉnh tồn kho và giao hàng kịp thời.
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke={theme.palette.primary.main} strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 320 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin nhanh
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Bảng điều khiển thiết kế cho quy trình hiện đại, với bảng phản hồi, bộ lọc tìm kiếm và trải nghiệm quản trị mượt mà.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2">• React + TypeScript</Typography>
              <Typography variant="body2">• Giao diện Material UI đáp ứng</Typography>
              <Typography variant="body2">• Biểu đồ và bảng dữ liệu theo thời gian thực</Typography>
              <Typography variant="body2">• Tối ưu cho desktop và mobile</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <AiForecastCard />
        </Grid>
        <Grid item xs={12} lg={4}>
          <AiChatBox />
        </Grid>
      </Grid>
    </Box>
  );
}
