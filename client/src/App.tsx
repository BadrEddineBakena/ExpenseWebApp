import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { DataRefreshProvider } from './contexts/DataRefreshContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import IncomesPage from './pages/incomes/IncomesPage';
import BudgetGoalsPage from './pages/budgetGoals/BudgetGoalsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

// Auth Guard
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/auth/login" />;
  }
  
  return <>{children}</>;
};

// Guest Guard
const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <DataRefreshProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <BrowserRouter>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth/login" element={
                    <GuestGuard>
                      <LoginPage />
                    </GuestGuard>
                  } />
                  <Route path="/auth/register" element={
                    <GuestGuard>
                      <RegisterPage />
                    </GuestGuard>
                  } />
                  <Route path="/auth/forgot-password" element={
                    <GuestGuard>
                      <ForgotPasswordPage />
                    </GuestGuard>
                  } />
                  <Route path="/auth/reset-password/:token" element={
                    <GuestGuard>
                      <ResetPasswordPage />
                    </GuestGuard>
                  } />

                  {/* Dashboard Routes */}
                  <Route path="/" element={
                    <AuthGuard>
                      <DashboardLayout />
                    </AuthGuard>
                  }>
                    <Route index element={<DashboardPage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="incomes" element={<IncomesPage />} />
                    <Route path="budget-goals" element={<BudgetGoalsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    {/* Add more routes for other features */}
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </BrowserRouter>
            </LocalizationProvider>
          </DataRefreshProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;