import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  FormHelperText,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import api from '@/services/axiosInstance';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
      submit: null
    },
    validationSchema: Yup.object({
      password: Yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(255)
        .required('Password is required'),
      confirmPassword: Yup
        .string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required')
    }),
    onSubmit: async (values, helpers) => {
      try {
        setError(null);
        await api.post('/users/reset-password', {
          token,
          password: values.password
        });
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.response?.data?.message || 'Failed to reset password' });
        helpers.setSubmitting(false);
        setError(error.response?.data?.message || 'Failed to reset password');
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>Reset Password | ExpenseApp</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              mb: 3,
              textAlign: 'center'
            }}
          >
            <Typography
              color="primary"
              variant="h4"
              sx={{ mb: 1 }}
            >
              ExpenseApp
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Reset your password
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 1,
              p: 4,
              width: 350
            }}
          >
            {success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your password has been reset successfully. You will be redirected to the login page.
                </Alert>
                <Link
                  component={RouterLink}
                  to="/auth/login"
                  variant="body2"
                >
                  Go to login
                </Link>
              </Box>
            ) : (
              <form
                noValidate
                onSubmit={formik.handleSubmit}
              >
                <Typography
                  sx={{ mb: 3 }}
                  variant="body2"
                >
                  Enter your new password below.
                </Typography>
                <Stack spacing={3}>
                  {error && (
                    <Alert severity="error">
                      {error}
                    </Alert>
                  )}
                  <TextField
                    error={!!(formik.touched.password && formik.errors.password)}
                    fullWidth
                    helperText={formik.touched.password && formik.errors.password}
                    label="New Password"
                    name="password"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="password"
                    value={formik.values.password}
                  />
                  <TextField
                    error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                    fullWidth
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    label="Confirm Password"
                    name="confirmPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="password"
                    value={formik.values.confirmPassword}
                  />
                </Stack>
                {formik.errors.submit && (
                  <FormHelperText
                    error
                    sx={{ mt: 3 }}
                  >
                    {formik.errors.submit as string}
                  </FormHelperText>
                )}
                <Button
                  disabled={formik.isSubmitting}
                  fullWidth
                  size="large"
                  sx={{ mt: 3 }}
                  type="submit"
                  variant="contained"
                >
                  Reset Password
                </Button>
                <Box
                  sx={{
                    mt: 3,
                    textAlign: 'center'
                  }}
                >
                  <Link
                    component={RouterLink}
                    to="/auth/login"
                    variant="body2"
                  >
                    Back to login
                  </Link>
                </Box>
              </form>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ResetPasswordPage; 