import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Tooltip,
  Grid as Grid2
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import api from '@/services/axiosInstance';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getCurrencySymbol, convertToDisplayValue } from '../../utils/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDataRefresh } from '@/contexts/DataRefreshContext';

interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  currency: string;
}

const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Personal',
  'Travel',
  'Other'
];

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { currency } = useCurrency();
  const { triggerRefresh } = useDataRefresh();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses');
      setExpenses(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    addFormik.resetForm();
  };

  const handleOpenEditDialog = (expense: Expense) => {
    setCurrentExpense(expense);
    setOpenEditDialog(true);
    editFormik.setValues({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date,
      submit: null
    });
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentExpense(null);
    editFormik.resetForm();
  };

  const handleOpenDeleteDialog = (expense: Expense) => {
    setCurrentExpense(expense);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentExpense(null);
  };

  const handleDeleteExpense = async () => {
    if (!currentExpense) return;
    
    try {
      await api.delete(`/expenses/${currentExpense.id}`);
      
      handleCloseDeleteDialog();
      handleOpenSnackbar('Expense deleted successfully', 'success');
      fetchExpenses();
      triggerRefresh();
    } catch (err: any) {
      handleOpenSnackbar(err.response?.data?.message || 'Failed to delete expense', 'error');
    }
  };

  const addFormik = useFormik({
    initialValues: {
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      submit: null
    },
    validationSchema: Yup.object({
      amount: Yup
        .number()
        .positive('Amount must be positive')
        .required('Amount is required'),
      description: Yup
        .string()
        .max(255)
        .required('Description is required'),
      category: Yup
        .string()
        .required('Category is required'),
      date: Yup
        .date()
        .required('Date is required')
    }),
    onSubmit: async (values, helpers) => {
      try {
        await api.post('/expenses', {
          amount: values.amount,
          description: values.description,
          category: values.category,
          date: values.date
        });
        
        handleCloseAddDialog();
        handleOpenSnackbar('Expense added successfully', 'success');
        fetchExpenses();
        triggerRefresh();
      } catch (err: any) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.response?.data?.message || 'Failed to add expense' });
        helpers.setSubmitting(false);
        handleOpenSnackbar(err.response?.data?.message || 'Failed to add expense', 'error');
      }
    }
  });

  const editFormik = useFormik({
    initialValues: {
      amount: 0,
      description: '',
      category: '',
      date: '',
      submit: null
    },
    validationSchema: Yup.object({
      amount: Yup
        .number()
        .positive('Amount must be positive')
        .required('Amount is required'),
      description: Yup
        .string()
        .max(255)
        .required('Description is required'),
      category: Yup
        .string()
        .required('Category is required'),
      date: Yup
        .date()
        .required('Date is required')
    }),
    onSubmit: async (values, helpers) => {
      if (!currentExpense) return;
      
      try {
        await api.put(`/expenses/${currentExpense.id}`, {
          amount: values.amount,
          description: values.description,
          category: values.category,
          date: values.date
        });
        
        handleCloseEditDialog();
        handleOpenSnackbar('Expense updated successfully', 'success');
        fetchExpenses();
        triggerRefresh();
      } catch (err: any) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.response?.data?.message || 'Failed to update expense' });
        helpers.setSubmitting(false);
        handleOpenSnackbar(err.response?.data?.message || 'Failed to update expense', 'error');
      }
    }
  });

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Expenses | ExpenseApp</title>
      </Helmet>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          ml: { sm: '240px' }
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Typography variant="h4">
              Expenses
            </Typography>
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Add Expense
            </Button>
          </Stack>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid2 container spacing={2} alignItems="center">
                <Grid2 item xs={12} md={6}>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                    placeholder="Search expenses"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Description</th>
                        <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Category</th>
                        <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Date</th>
                        <th style={{ textAlign: 'right', padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Amount</th>
                        <th style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
                            No expenses found
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <tr key={expense.id}>
                            <td style={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{expense.description}</td>
                            <td style={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{expense.category}</td>
                            <td style={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{new Date(expense.date).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right', padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{getCurrencySymbol(currency)}{convertToDisplayValue(expense.amount, currency).toFixed(2)}</td>
                            <td style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                              <Tooltip title="Edit">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenEditDialog(expense)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  onClick={() => handleOpenDeleteDialog(expense)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      {/* Add Expense Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={addFormik.handleSubmit} sx={{ mt: 2 }}>
            <Grid2 container spacing={2}>
              <Grid2 item xs={12}>
                <TextField
                  error={!!(addFormik.touched.description && addFormik.errors.description)}
                  fullWidth
                  helperText={addFormik.touched.description && addFormik.errors.description}
                  label="Description"
                  name="description"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.description}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <TextField
                  error={!!(addFormik.touched.amount && addFormik.errors.amount)}
                  fullWidth
                  helperText={addFormik.touched.amount && addFormik.errors.amount}
                  label="Amount"
                  name="amount"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  type="number"
                  value={addFormik.values.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    error={!!(addFormik.touched.category && addFormik.errors.category)}
                    label="Category"
                    name="category"
                    onBlur={addFormik.handleBlur}
                    onChange={addFormik.handleChange}
                    value={addFormik.values.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 item xs={12}>
                <TextField
                  error={!!(addFormik.touched.date && addFormik.errors.date)}
                  fullWidth
                  helperText={addFormik.touched.date && addFormik.errors.date}
                  label="Date"
                  name="date"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  type="date"
                  value={addFormik.values.date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid2>
            </Grid2>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={() => addFormik.handleSubmit()} 
            variant="contained"
            disabled={addFormik.isSubmitting}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={editFormik.handleSubmit} sx={{ mt: 2 }}>
            <Grid2 container spacing={2}>
              <Grid2 item xs={12}>
                <TextField
                  error={!!(editFormik.touched.description && editFormik.errors.description)}
                  fullWidth
                  helperText={editFormik.touched.description && editFormik.errors.description}
                  label="Description"
                  name="description"
                  onBlur={editFormik.handleBlur}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.description}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <TextField
                  error={!!(editFormik.touched.amount && editFormik.errors.amount)}
                  fullWidth
                  helperText={editFormik.touched.amount && editFormik.errors.amount}
                  label="Amount"
                  name="amount"
                  onBlur={editFormik.handleBlur}
                  onChange={editFormik.handleChange}
                  type="number"
                  value={editFormik.values.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    error={!!(editFormik.touched.category && editFormik.errors.category)}
                    label="Category"
                    name="category"
                    onBlur={editFormik.handleBlur}
                    onChange={editFormik.handleChange}
                    value={editFormik.values.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 item xs={12}>
                <TextField
                  error={!!(editFormik.touched.date && editFormik.errors.date)}
                  fullWidth
                  helperText={editFormik.touched.date && editFormik.errors.date}
                  label="Date"
                  name="date"
                  onBlur={editFormik.handleBlur}
                  onChange={editFormik.handleChange}
                  type="date"
                  value={editFormik.values.date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid2>
            </Grid2>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={() => editFormik.handleSubmit()} 
            variant="contained"
            disabled={editFormik.isSubmitting}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Expense Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteExpense} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExpensesPage; 