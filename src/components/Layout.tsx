import React from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme, Stack, InputBase, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';

const drawerWidth = 264;
const navItems = [
  { label: 'Tổng quan', path: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Người dùng', path: '/users', icon: <PeopleAltRoundedIcon /> },
  { label: 'Sản phẩm', path: '/products', icon: <Inventory2RoundedIcon /> },
  { label: 'Đơn hàng', path: '/orders', icon: <ShoppingCartRoundedIcon /> },
];

interface LayoutProps { mode: 'light' | 'dark'; onToggleTheme: () => void; }

export default function Layout({ mode, onToggleTheme }: LayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const current = navItems.find((item) => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(item.path)));

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', px: 1.5, bgcolor: 'background.paper' }}>
      <Toolbar sx={{ px: 1.5, py: 3, minHeight: 'unset !important' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42, fontSize: 15, fontWeight: 800 }}>AD</Avatar>
          <Box><Typography fontWeight={800}>Nexus Admin</Typography><Typography variant="caption" color="text.secondary">Workspace quản trị</Typography></Box>
        </Stack>
      </Toolbar>
      <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, letterSpacing: 1.2 }}>Workspace</Typography>
      <List sx={{ pt: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return <ListItemButton key={item.path} component={RouterLink} to={item.path} selected={selected} onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2.5, mb: .5, py: 1.25, '&.Mui-selected': { color: 'primary.main', bgcolor: 'primary.light', '& .MuiListItemIcon-root': { color: 'primary.main' } }, '&:hover': { bgcolor: 'action.hover' } }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 750 : 600 }} />
          </ListItemButton>;
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: 'primary.light' }}><Typography variant="subtitle2" color="primary.dark" fontWeight={800}>Mẹo nhanh</Typography><Typography variant="caption" color="text.secondary">Dùng ô tìm kiếm để truy cập nhanh dữ liệu.</Typography></Box>
      <Divider />
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ p: 1.5 }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 13 }}>QT</Avatar><Box sx={{ minWidth: 0, flexGrow: 1 }}><Typography variant="body2" fontWeight={750} noWrap>Quản trị viên</Typography><Typography variant="caption" color="text.secondary">Administrator</Typography></Box></Stack>
    </Box>
  );

  return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ zIndex: theme.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ gap: 2, minHeight: { xs: 68, md: 76 } }}>
        {!isDesktop && <IconButton onClick={() => setMobileOpen(!mobileOpen)} aria-label="Mở menu"><MenuIcon /></IconButton>}
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Workspace /</Typography><Typography fontWeight={800}>{current?.label ?? 'Tổng quan'}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, px: 1.5, py: .75, borderRadius: 2, bgcolor: 'action.hover', width: 220 }}><SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /><InputBase placeholder="Tìm kiếm..." sx={{ fontSize: 14, flex: 1 }} /></Box>
        <IconButton aria-label="Thông báo"><Badge color="secondary" variant="dot"><NotificationsNoneRoundedIcon /></Badge></IconButton><IconButton onClick={onToggleTheme} aria-label="Chuyển đổi chủ đề">{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton><Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 12 }}>QT</Avatar>
      </Toolbar>
    </AppBar>
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}><Drawer variant={isDesktop ? 'permanent' : 'temporary'} open={isDesktop || mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 0, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' } }}>{drawer}</Drawer></Box>
    <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, lg: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}><Toolbar /><Box sx={{ maxWidth: 1480, mx: 'auto' }}><Outlet /></Box></Box>
  </Box>;
}
