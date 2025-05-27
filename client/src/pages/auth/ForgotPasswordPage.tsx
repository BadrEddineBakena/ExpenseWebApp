import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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

const ForgotPasswordPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required')
    }),
    onSubmit: async (values, helpers) => {
      try {
        setError(null);
        await api.post('/users/forgot-password', {
          email: values.email
        });
        
        setSuccess(true);
        helpers.resetForm();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.response?.data?.message || 'Failed to send reset email' });
        helpers.setSubmitting(false);
        setError(error.response?.data?.message || 'Failed to send reset email');
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>Forgot Password | ExpenseApp</title>
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
              Forgot your password?
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
                  If an account exists with that email, we've sent password reset instructions.
                </Alert>
                <Link
                  component={RouterLink}
                  to="/auth/login"
                  variant="body2"
                >
                  Return to login
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
                  Enter your email address and we'll send you instructions to reset your password.
                </Typography>
                <Stack spacing={3}>
                  {error && (
                    <Alert severity="error">
                      {error}
                    </Alert>
                  )}
                  <TextField
                    error={!!(formik.touched.email && formik.errors.email)}
                    fullWidth
                    helperText={formik.touched.email && formik.errors.email}
                    label="Email Address"
                    name="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="email"
                    value={formik.values.email}
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
                  Send Reset Link
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

export default ForgotPasswordPage; 