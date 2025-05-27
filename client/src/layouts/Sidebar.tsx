import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Drawer, Stack, SvgIcon, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import SavingsIcon from '@mui/icons-material/Savings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

interface SidebarItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

const items: SidebarItem[] = [
  {
    path: '/',
    icon: HomeIcon,
    label: 'Dashboard'
  },
  {
    path: '/expenses',
    icon: ReceiptIcon,
    label: 'Expenses'
  },
  {
    path: '/incomes',
    icon: MoneyIcon,
    label: 'Incomes'
  },
  {
    path: '/budget-goals',
    icon: SavingsIcon,
    label: 'Budget Goals'
  },
  {
    path: '/reports',
    icon: AssessmentIcon,
    label: 'Reports'
  },
  {
    path: '/settings',
    icon: SettingsIcon,
    label: 'Settings'
  }
];

interface SidebarProps {
  onClose: () => void;
  open: boolean;
}

const Sidebar = ({ onClose, open }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      onClose?.();
    }
  }, [onClose, open]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/auth/login');
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'inline-flex',
            height: 32,
            textDecoration: 'none',
            color: 'primary.main'
          }}
        >
          <Typography variant="h5" fontWeight="bold">ExpenseApp</Typography>
        </Box>
      </Box>
      <Box
        component="nav"
        sx={{
          flexGrow: 1,
          px: 2,
          py: 3
        }}
      >
        <Stack
          component="ul"
          spacing={1}
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0
          }}
        >
          {items.map((item) => {
            const active = item.path === location.pathname;

            return (
              <li key={item.path}>
                <Button
                  component={Link}
                  to={item.path}
                  startIcon={(
                    <SvgIcon>
                      <item.icon />
                    </SvgIcon>
                  )}
                  disableRipple
                  sx={{
                    backgroundColor: active ? 'neutral.200' : 'transparent',
                    borderRadius: 1,
                    color: active ? 'primary.main' : 'neutral.600',
                    fontWeight: active ? 'fontWeightBold' : 'fontWeightMedium',
                    justifyContent: 'flex-start',
                    px: 3,
                    textAlign: 'left',
                    textTransform: 'none',
                    width: '100%',
                    '& .MuiButton-startIcon': {
                      color: active ? 'primary.main' : 'neutral.500'
                    },
                    '&:hover': {
                      backgroundColor: 'neutral.100'
                    }
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    {item.label}
                  </Box>
                </Button>
              </li>
            );
          })}
        </Stack>
      </Box>
      <Box sx={{ px: 2, py: 3 }}>
        <Button
          onClick={handleLogout}
          startIcon={(
            <SvgIcon>
              <LogoutIcon />
            </SvgIcon>
          )}
          disableRipple
          sx={{
            backgroundColor: 'transparent',
            borderRadius: 1,
            color: 'neutral.600',
            fontWeight: 'fontWeightMedium',
            justifyContent: 'flex-start',
            px: 3,
            textAlign: 'left',
            textTransform: 'none',
            width: '100%',
            '& .MuiButton-startIcon': {
              color: 'neutral.500'
            },
            '&:hover': {
              backgroundColor: 'neutral.100'
            }
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            Logout
          </Box>
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          width: 280
        }
      }}
      variant="permanent"
    >
      {content}
    </Drawer>
  );
};

export default Sidebar; 