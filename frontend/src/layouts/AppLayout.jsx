import { useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { navigationItems } from '../constants/navigation';
import { brand, sidebarCollapsedWidth, sidebarExpandedWidth } from '../constants/colors';
import ConfirmDialog from '../components/ConfirmDialog';
import DiscordServerSetupDialog from '../components/DiscordServerSetupDialog';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { useDiscordSetupPrompt } from '../hooks/useDiscordSetupPrompt';

const SIDEBAR_STORAGE_KEY = 'dashboard-sidebar-expanded';

const AppLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false',
  );
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    open: setupOpen,
    onboarding: setupOnboarding,
    initialValues: setupInitialValues,
    closeDialog: closeSetupDialog,
    completeSetup,
  } = useDiscordSetupPrompt();

  const drawerWidth = isDesktop
    ? sidebarExpanded
      ? sidebarExpandedWidth
      : sidebarCollapsedWidth
    : sidebarExpandedWidth;

  const toggleSidebar = () => {
    setSidebarExpanded((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  const showLabels = !isDesktop || sidebarExpanded;

  const drawerPaperSx = {
    width: drawerWidth,
    boxSizing: 'border-box',
    overflowX: 'hidden',
    bgcolor: brand.primary,
    color: brand.white,
    border: 'none',
    borderRadius: { md: '0 28px 28px 0' },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };

  const drawerContent = useMemo(
    () => (
      <Box sx={{ py: 2.5, px: showLabels ? 2 : 1.25, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2.5} sx={{ flex: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={showLabels ? 'space-between' : 'center'}
            spacing={1}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(brand.white, 0.14),
                  flexShrink: 0,
                }}
              >
                <SmartToyRoundedIcon fontSize="small" sx={{ color: brand.white }} />
              </Box>
              {showLabels ? (
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1, color: brand.white }}>
                    Abstrabit
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha(brand.white, 0.72) }}>
                    Bot Dashboard
                  </Typography>
                </Box>
              ) : null}
            </Stack>
            {showLabels && isDesktop ? (
              <IconButton size="small" onClick={toggleSidebar} sx={{ color: brand.white }} aria-label="Collapse sidebar">
                <ChevronLeftRoundedIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Stack>

          {!showLabels && isDesktop ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton size="small" onClick={toggleSidebar} sx={{ color: brand.white }} aria-label="Expand sidebar">
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : null}

          <List sx={{ p: 0, width: '100%' }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;

              const button = (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    minHeight: 48,
                    justifyContent: showLabels ? 'flex-start' : 'center',
                    px: showLabels ? 1.5 : 1,
                    mb: 0.75,
                    borderRadius: '18px',
                    bgcolor: active ? alpha(brand.white, 0.16) : 'transparent',
                    color: brand.white,
                    '&:hover': {
                      bgcolor: alpha(brand.white, 0.12),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: showLabels ? 36 : 0,
                      justifyContent: 'center',
                      color: 'inherit',
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {showLabels ? (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 700, noWrap: true }}
                    />
                  ) : null}
                  {showLabels && active ? (
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: brand.white, flexShrink: 0 }} />
                  ) : null}
                </ListItemButton>
              );

              return showLabels ? (
                button
              ) : (
                <Tooltip key={item.path} title={item.label} placement="right">
                  {button}
                </Tooltip>
              );
            })}
          </List>
        </Stack>

        {showLabels ? (
          <Button
            fullWidth
            onClick={() => setConfirmOpen(true)}
            startIcon={<LogoutRoundedIcon />}
            sx={{
              mt: 2,
              bgcolor: brand.white,
              color: brand.primary,
              borderRadius: 999,
              py: 1.1,
              fontWeight: 800,
              '&:hover': { bgcolor: alpha(brand.white, 0.92) },
            }}
          >
            Logout
          </Button>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton
              onClick={() => setConfirmOpen(true)}
              sx={{
                alignSelf: 'center',
                mt: 2,
                bgcolor: brand.white,
                color: brand.primary,
                '&:hover': { bgcolor: alpha(brand.white, 0.92) },
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    [isDesktop, pathname, showLabels],
  );

  const searchField = (
    <TextField
      size="small"
      placeholder="Search dashboard"
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && search.trim()) {
          navigate(`/commands?search=${encodeURIComponent(search.trim())}`);
        }
      }}
      sx={{
        width: '100%',
        maxWidth: { md: 420, lg: 480 },
        '& .MuiOutlinedInput-root': {
          borderRadius: 999,
          bgcolor: brand.white,
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchRoundedIcon fontSize="small" sx={{ color: brand.textMuted }} />
          </InputAdornment>
        ),
      }}
    />
  );

  const profileActions = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexShrink: 0,
        bgcolor: brand.primary,
        borderRadius: 999,
        pl: 0.5,
        pr: 1,
        py: 0.5,
      }}
    >
      <Box onClick={() => navigate('/profile')} sx={{ cursor: 'pointer' }}>
        <UserAvatar user={user} size={40} />
      </Box>
      <IconButton
        onClick={() => setConfirmOpen(true)}
        sx={{ color: brand.white, display: { xs: 'none', sm: 'inline-flex' } }}
        size="small"
      >
        <LogoutRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: brand.mint,
        p: { xs: 0, md: 1.5 },
        gap: { md: 0 },
      }}
    >
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { ...drawerPaperSx, borderRadius: '0 28px 28px 0' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: brand.content,
          borderRadius: { xs: 0, md: '28px' },
          overflow: 'hidden',
          boxShadow: { md: '0 12px 40px rgba(45, 107, 87, 0.08)' },
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 2.5, md: 3, lg: 3.5 }, py: { xs: 2, sm: 2.5, md: 3 } }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <Box sx={{ width: '100%' }}>
              <Stack
                direction="row"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                  <IconButton sx={{ display: { md: 'none' }, flexShrink: 0 }} onClick={() => setMobileOpen(true)}>
                    <MenuRoundedIcon />
                  </IconButton>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: '1.35rem', sm: '1.65rem', md: '2rem' },
                        lineHeight: 1.15,
                        color: brand.text,
                      }}
                    >
                      Welcome back 👋
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user?.name || 'Admin'}, here is your Discord bot overview.
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, justifyContent: 'center', px: 2 }}>
                  {searchField}
                </Box>

                {profileActions}
              </Stack>

              <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1.5 }}>{searchField}</Box>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' }, mt: 1 }}>
                {user?.name || 'Admin'}, here is your Discord bot overview.
              </Typography>
            </Box>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
              <Outlet />
            </motion.div>
          </Stack>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Logout from dashboard?"
        description="This will clear your admin session and disconnect live updates."
        confirmText="Logout"
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await logout();
          setConfirmOpen(false);
        }}
      />

      <DiscordServerSetupDialog
        open={setupOpen}
        onboarding={setupOnboarding}
        initialValues={setupInitialValues}
        onClose={closeSetupDialog}
        onComplete={completeSetup}
      />
    </Box>
  );
};

export default AppLayout;
