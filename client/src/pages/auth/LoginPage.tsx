import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '@/services/axiosInstance';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string|null>(null);
  const [forgotError, setForgotError] = useState<string|null>(null);

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleSubmit = async (
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/login', values);
      localStorage.setItem('accessToken', response.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
      helpers.setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotStatus(null);
    setForgotError(null);
    try {
      await api.post('/users/forgot-password', { email: forgotEmail });
      setForgotStatus('If your email exists, you will receive a password reset link.');
    } catch (err) {
      setForgotError('Failed to send reset email.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | ExpenseApp</title>
      </Helmet>
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Typography component="h1" variant="h4">
                  Sign in
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/auth/register">
                    Sign up
                  </Link>
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {(formikProps: FormikProps<LoginFormValues>) => (
                  <Form>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formikProps.values.email}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      error={formikProps.touched.email && Boolean(formikProps.errors.email)}
                      helperText={formikProps.touched.email && formikProps.errors.email}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formikProps.values.password}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      error={formikProps.touched.password && Boolean(formikProps.errors.password)}
                      helperText={formikProps.touched.password && formikProps.errors.password}
                      margin="normal"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Link href="#" onClick={e => { e.preventDefault(); setForgotOpen(true); }} variant="body2">
                        Forgot Password?
                      </Link>
                    </Box>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={formikProps.isSubmitting || loading}
                      sx={{ mt: 3 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <MuiDialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <MuiDialogTitle>Forgot Password</MuiDialogTitle>
        <MuiDialogContent>
          <TextField
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          {forgotStatus && <Alert severity="success" sx={{ mt: 2 }}>{forgotStatus}</Alert>}
          {forgotError && <Alert severity="error" sx={{ mt: 2 }}>{forgotError}</Alert>}
        </MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={() => setForgotOpen(false)}>Cancel</Button>
          <Button onClick={handleForgotPassword} variant="contained">Send Reset Link</Button>
        </MuiDialogActions>
      </MuiDialog>
    </>
  );
};

export default LoginPage; 