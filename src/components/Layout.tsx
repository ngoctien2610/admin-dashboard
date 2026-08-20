import React from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme, Stack, InputBase, Badge, Dialog, DialogTitle, DialogContent, ListItem, ListItemAvatar, CircularProgress, Chip } from '@mui/material';
import { Menu, MenuItem as PopupMenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { useAiSearch } from '../hooks/useAiApi';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useAuth } from '../auth/AuthContext';

const drawerWidth = 264;
const navItems = [
  { label: 'Tổng quan', path: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Người dùng', path: '/users', icon: <PeopleAltRoundedIcon /> },
  { label: 'Sản phẩm', path: '/products', icon: <Inventory2RoundedIcon /> },
  { label: 'Đơn hàng', path: '/orders', icon: <ShoppingCartRoundedIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <AssessmentRoundedIcon /> },
  { label: 'Audit Log', path: '/audit-log', icon: <HistoryRoundedIcon /> },
  { label: 'RBAC & quyền', path: '/rbac', icon: <AdminPanelSettingsRoundedIcon /> },
  { label: 'Tồn kho', path: '/inventory', icon: <WarehouseRoundedIcon /> },
  { label: 'Operations', path: '/operations', icon: <BuildRoundedIcon /> },
];

interface LayoutProps { mode: 'light' | 'dark'; onToggleTheme: () => void; }

export default function Layout({ mode, onToggleTheme }: LayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { suggestions, loading, search } = useAiSearch();
  const [searchText, setSearchText] = React.useState('');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { notifications, clearNotifications } = useRealtimeNotifications();
  const [notificationAnchor, setNotificationAnchor] = React.useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const current = navItems.find((item) => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(item.path)));

  React.useEffect(() => {
    const timeout = window.setTimeout(() => search(searchText), 250);
    return () => window.clearTimeout(timeout);
  }, [searchText, search]);

  React.useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const openResult = (result: { type: string; id?: number }) => {
    const path = result.type === 'Product' && result.id ? `/products/${result.id}` : result.type === 'User' && result.id ? `/users/${result.id}` : result.type === 'Order' && result.id ? `/orders/${result.id}` : '/';
    navigate(path);
    setSearchOpen(false);
  };

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
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ p: 1.5 }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 13 }}>{user?.name?.[0] || 'A'}</Avatar><Box sx={{ minWidth: 0, flexGrow: 1 }}><Typography variant="body2" fontWeight={750} noWrap>{user?.name}</Typography><Typography variant="caption" color="text.secondary">{user?.role}</Typography></Box><Button size="small" onClick={() => void logout()}>Thoát</Button></Stack>
    </Box>
  );

  return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ zIndex: theme.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ gap: 2, minHeight: { xs: 68, md: 76 } }}>
        {!isDesktop && <IconButton onClick={() => setMobileOpen(!mobileOpen)} aria-label="Mở menu"><MenuIcon /></IconButton>}
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Workspace /</Typography><Typography fontWeight={800}>{current?.label ?? 'Tổng quan'}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box onClick={() => setSearchOpen(true)} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, px: 1.5, py: .75, borderRadius: 2, bgcolor: 'action.hover', width: 260, cursor: 'pointer' }}><SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /><Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>Tìm kiếm dữ liệu...</Typography><Chip label="Ctrl K" size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} /></Box>
        <IconButton aria-label="Thông báo" onClick={(event) => setNotificationAnchor(event.currentTarget)}><Badge color="secondary" badgeContent={notifications.length}><NotificationsNoneRoundedIcon /></Badge></IconButton><IconButton onClick={onToggleTheme} aria-label="Chuyển đổi chủ đề">{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton><Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 12 }}>QT</Avatar>
      </Toolbar>
    </AppBar>
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}><Drawer variant={isDesktop ? 'permanent' : 'temporary'} open={isDesktop || mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 0, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' } }}>{drawer}</Drawer></Box>
    <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, lg: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}><Toolbar /><Box sx={{ maxWidth: 1480, mx: 'auto' }}><Outlet /></Box></Box>
    <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>Tìm kiếm nhanh</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, mb: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <SearchRoundedIcon color="action" />
          <InputBase autoFocus fullWidth placeholder="Tên, email, mã đơn hàng hoặc sản phẩm..." value={searchText} onChange={(event) => setSearchText(event.target.value)} />
          {loading && <CircularProgress size={20} />}
        </Box>
        {searchText.trim() && !loading && suggestions.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 4 }}><SearchOffRoundedIcon color="disabled" /><Typography color="text.secondary">Không tìm thấy kết quả phù hợp.</Typography></Stack>
        ) : (
          <List disablePadding>
            {suggestions.map((result) => (
              <ListItem key={`${result.type}-${result.id}`} component="button" onClick={() => openResult(result)} sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                <ListItemAvatar><Avatar sx={{ bgcolor: result.type === 'Product' ? 'secondary.light' : 'primary.light', color: result.type === 'Product' ? 'secondary.dark' : 'primary.main' }}>{result.type[0]}</Avatar></ListItemAvatar>
                <ListItemText primary={result.label} secondary={result.meta} />
                <Chip label={result.type} size="small" variant="outlined" />
              </ListItem>
            ))}
          </List>
        )}
        {!searchText.trim() && <Typography variant="caption" color="text.secondary">Gợi ý: tìm theo tên người dùng, email, tên sản phẩm hoặc mã đơn hàng.</Typography>}
      </DialogContent>
    </Dialog>
    <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)}>
      <PopupMenuItem disabled sx={{ opacity: 1, fontWeight: 800 }}>Thông báo realtime ({notifications.length})</PopupMenuItem>
      {notifications.length === 0 ? <PopupMenuItem disabled>Chưa có thông báo mới.</PopupMenuItem> : notifications.slice(0, 6).map((notification) => <PopupMenuItem key={notification.id} sx={{ display: 'block', width: 340, whiteSpace: 'normal' }}><Typography variant="body2" fontWeight={700}>{notification.title}</Typography><Typography variant="caption" color="text.secondary">{notification.message}</Typography></PopupMenuItem>)}
      {notifications.length > 0 && <PopupMenuItem onClick={() => { clearNotifications(); setNotificationAnchor(null); }} sx={{ color: 'primary.main', fontWeight: 700 }}>Đánh dấu đã đọc</PopupMenuItem>}
    </Menu>
  </Box>;
}
