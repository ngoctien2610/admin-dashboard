import React from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const drawerWidth = 280;
const navItems = [
  { label: 'Bảng điều khiển', path: '/', icon: <DashboardIcon /> },
  { label: 'Người dùng', path: '/users', icon: <PeopleIcon /> },
  { label: 'Sản phẩm', path: '/products', icon: <Inventory2Icon /> },
  { label: 'Đơn hàng', path: '/orders', icon: <ShoppingCartIcon /> },
];

interface LayoutProps {
  mode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Layout({ mode, onToggleTheme }: LayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 3 }}>
        <Stack alignItems="center" spacing={1}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>AD</Avatar>
          <Typography variant="h6">Cổng quản trị</Typography>
          <Typography variant="caption" color="text.secondary">
            Bảng điều khiển quản lý thông minh
          </Typography>
        </Stack>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            }
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ px: 3, py: 4, bgcolor: theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.06)' : 'rgba(79, 70, 229, 0.14)', borderRadius: 3, m: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Xây dựng bằng React, TypeScript và Material UI.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={1}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: theme.palette.background.paper,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2 }}
              aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Bảng quản trị
          </Typography>
          <IconButton color="inherit" onClick={onToggleTheme} aria-label="chuyển đổi chủ đề">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: '0',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
