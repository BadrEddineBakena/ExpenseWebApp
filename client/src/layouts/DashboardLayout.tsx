import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { createTheme } from '../theme';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(true);
  const theme = createTheme();

  const handleSidebarOpen = () => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        width: '100%'
      }}>
        <Sidebar
          onClose={handleSidebarClose}
          open={openSidebar}
        />
        <Box
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            width: '100%'
          }}
        >
          <Header 
            onSidebarOpen={handleSidebarOpen}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              py: 8,
              px: 4
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout; 