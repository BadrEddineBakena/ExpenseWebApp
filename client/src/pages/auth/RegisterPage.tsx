import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import axios from 'axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      fullname: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      submit: null
    },
    validationSchema: Yup.object({
      fullname: Yup
        .string()
        .max(255)
        .required('Full name is required'),
      username: Yup
        .string()
        .max(255)
        .required('Username is required'),
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
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
        await axios.post('/users/signup', {
          fullname: values.fullname,
          username: values.username,
          email: values.email,
          password: values.password
        });
        
        navigate('/auth/login', { state: { registered: true } });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.response?.data?.message || 'Failed to register' });
        helpers.setSubmitting(false);
        setError(error.response?.data?.message || 'Failed to register');
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>Register | ExpenseApp</title>
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
              Create a new account
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
            <form
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Stack spacing={3}>
                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}
                <TextField
                  error={!!(formik.touched.fullname && formik.errors.fullname)}
                  fullWidth
                  helperText={formik.touched.fullname && formik.errors.fullname}
                  label="Full Name"
                  name="fullname"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fullname}
                />
                <TextField
                  error={!!(formik.touched.username && formik.errors.username)}
                  fullWidth
                  helperText={formik.touched.username && formik.errors.username}
                  label="Username"
                  name="username"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.username}
                />
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
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
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
                Register
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
                  Already have an account? Sign in
                </Link>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default RegisterPage; 