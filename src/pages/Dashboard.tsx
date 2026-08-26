import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, Typography, Paper, Chip, Button, Stack, useTheme } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardMetrics, ordersChartData } from '../data/mockData';
import { AiForecastCard } from '../components/AiForecastCard';
import { AiChatBox } from '../components/AiChatBox';

const icons = [<AttachMoneyRoundedIcon />, <ShoppingCartRoundedIcon />, <PeopleAltRoundedIcon />, <Inventory2RoundedIcon />];

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ maxWidth: 720 }}><Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing={1.2}>THỨ HAI, 18 THÁNG 8, 2026</Typography><Typography variant="h4" sx={{ mt: .75 }}>Chào mừng quay lại, quản trị viên</Typography><Typography color="text.secondary" sx={{ mt: 1.25, fontSize: 16 }}>Đây là tổng quan hiệu suất hệ thống của bạn hôm nay. Theo dõi những thay đổi quan trọng và đưa ra quyết định nhanh hơn.</Typography></Box>
      <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/analytics')}>Xem báo cáo</Button>
    </Box>
    <Grid container spacing={2.5}>{dashboardMetrics.map((metric, index) => { const down = index === 3; return <Grid item xs={12} sm={6} lg={3} key={metric.label}><Paper sx={{ p: 2.75, height: '100%', transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: 8 } }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box sx={{ p: 1.25, borderRadius: 2, bgcolor: index === 1 ? 'secondary.light' : 'primary.light', color: index === 1 ? 'secondary.main' : 'primary.main', display: 'flex' }}>{icons[index]}</Box><Chip size="small" color={down ? 'default' : 'success'} icon={down ? <ArrowDownwardRoundedIcon /> : <ArrowUpwardRoundedIcon />} label={metric.caption} /></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{metric.label}</Typography><Typography variant="h5" sx={{ mt: .5 }}>{metric.value}</Typography></Paper></Grid>; })}</Grid>
    <Grid container spacing={2.5}>
      <Grid item xs={12} lg={8}><Card><CardContent sx={{ p: { xs: 2, md: 3 } }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}><Box><Typography variant="h6">Đơn hàng hàng tuần</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Hiệu suất đơn hàng trong 7 ngày gần nhất</Typography></Box><Chip label="7 ngày" variant="outlined" /></Stack><Box sx={{ height: 310 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={ordersChartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} /><XAxis dataKey="name" stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} /><YAxis stroke={theme.palette.text.secondary} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }} /><Line type="monotone" dataKey="sales" stroke={theme.palette.primary.main} strokeWidth={4} dot={{ r: 4, fill: theme.palette.background.paper, strokeWidth: 3 }} activeDot={{ r: 7 }} /></LineChart></ResponsiveContainer></Box></CardContent></Card></Grid>
      <Grid item xs={12} lg={4}><Paper sx={{ p: 3, height: '100%', background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: '#fff', border: 0 }}><Stack direction="row" justifyContent="space-between"><Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,.16)', display: 'flex' }}><TrendingUpRoundedIcon /></Box><Chip label="+18.6%" sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,.14)' }} /></Stack><Typography variant="h5" sx={{ mt: 5, color: '#fff' }}>Tăng trưởng ổn định</Typography><Typography sx={{ mt: 1, color: 'rgba(255,255,255,.75)' }}>Doanh thu và lượng đơn hàng đang tăng tốt so với tuần trước.</Typography><Button sx={{ mt: 4, color: '#fff', borderColor: 'rgba(255,255,255,.4)' }} variant="outlined" onClick={() => navigate('/analytics')}>Xem phân tích</Button></Paper></Grid>
    </Grid>
    <Grid container spacing={2.5}><Grid item xs={12} lg={8}><AiForecastCard /></Grid><Grid item xs={12} lg={4}><AiChatBox /></Grid></Grid>
  </Box>;
}
