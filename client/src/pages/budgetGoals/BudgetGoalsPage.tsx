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
  LinearProgress,
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

interface BudgetGoal {
  id: number;
  amount: number;
  startDate: string;
  endDate: string;
  category: string;
  userId: number;
  currency: string;
}

const categories = [
  'Emergency Fund',
  'Retirement',
  'Vacation',
  'Car',
  'Home',
  'Education',
  'Wedding',
  'Other'
];

const BudgetGoalsPage = () => {
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [currentBudgetGoal, setCurrentBudgetGoal] = useState<BudgetGoal | null>(null);
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

  const fetchBudgetGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/budget-goals');
      setBudgetGoals(response.data);
      setLoading(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch budget goals');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetGoals();
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

  const handleOpenEditDialog = (budgetGoal: BudgetGoal) => {
    setCurrentBudgetGoal(budgetGoal);
    setOpenEditDialog(true);
    editFormik.setValues({
      amount: budgetGoal.amount,
      startDate: budgetGoal.startDate,
      endDate: budgetGoal.endDate,
      category: budgetGoal.category,
      submit: null
    });
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentBudgetGoal(null);
    editFormik.resetForm();
  };

  const handleOpenDeleteDialog = (budgetGoal: BudgetGoal) => {
    setCurrentBudgetGoal(budgetGoal);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentBudgetGoal(null);
  };

  const handleDeleteBudgetGoal = async () => {
    if (!currentBudgetGoal) return;
    
    try {
      await api.delete(`/budget-goals/${currentBudgetGoal.id}`);
      
      handleCloseDeleteDialog();
      handleOpenSnackbar('Budget goal deleted successfully', 'success');
      fetchBudgetGoals();
      triggerRefresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      handleOpenSnackbar(error.response?.data?.message || 'Failed to delete budget goal', 'error');
    }
  };

  const addFormik = useFormik({
    initialValues: {
      amount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      category: '',
      submit: null
    },
    validationSchema: Yup.object({
      amount: Yup
        .number()
        .positive('Amount must be positive')
        .required('Amount is required'),
      startDate: Yup
        .date()
        .required('Start date is required'),
      endDate: Yup
        .date()
        .required('End date is required')
        .test('isAfterStartDate', 'End date must be after start date', function(value) {
          const { startDate } = this.parent;
          return new Date(value) > new Date(startDate);
        }),
      category: Yup
        .string()
        .required('Category is required')
    }),
    onSubmit: async (values, helpers) => {
      try {
        await api.post('/budget-goals', {
          amount: values.amount,
          startDate: values.startDate,
          endDate: values.endDate,
          category: values.category
        });
        
        handleCloseAddDialog();
        handleOpenSnackbar('Budget goal added successfully', 'success');
        fetchBudgetGoals();
        triggerRefresh();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.response?.data?.message || 'Failed to add budget goal' });
        helpers.setSubmitting(false);
        handleOpenSnackbar(error.response?.data?.message || 'Failed to add budget goal', 'error');
      }
    }
  });

  const editFormik = useFormik({
    initialValues: {
      amount: 0,
      startDate: '',
      endDate: '',
      category: '',
      submit: null
    },
    validationSchema: Yup.object({
      amount: Yup
        .number()
        .positive('Amount must be positive')
        .required('Amount is required'),
      startDate: Yup
        .date()
        .required('Start date is required'),
      endDate: Yup
        .date()
        .required('End date is required')
        .test('isAfterStartDate', 'End date must be after start date', function(value) {
          const { startDate } = this.parent;
          return new Date(value) > new Date(startDate);
        }),
      category: Yup
        .string()
        .required('Category is required')
    }),
    onSubmit: async (values, helpers) => {
      if (!currentBudgetGoal) return;
      
      try {
        await api.put(`/budget-goals/${currentBudgetGoal.id}`, {
          amount: values.amount,
          startDate: values.startDate,
          endDate: values.endDate,
          category: values.category
        });
        
        handleCloseEditDialog();
        handleOpenSnackbar('Budget goal updated successfully', 'success');
        fetchBudgetGoals();
        triggerRefresh();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.response?.data?.message || 'Failed to update budget goal' });
        helpers.setSubmitting(false);
        handleOpenSnackbar(error.response?.data?.message || 'Failed to update budget goal', 'error');
      }
    }
  });

  const filteredBudgetGoals = budgetGoals.filter(budgetGoal => 
    budgetGoal.amount.toString().includes(searchTerm) ||
    budgetGoal.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateProgress = (amount: number) => {
    return Math.min(Math.round((amount / 100) * 100), 100);
  };

  return (
    <>
      <Helmet>
        <title>Budget Goals | ExpenseApp</title>
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
              Budget Goals
            </Typography>
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Add Goal
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
                    placeholder="Search budget goals"
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
            <Grid2 container spacing={3}>
              {filteredBudgetGoals.length === 0 ? (
                <Grid2 item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography align="center">No budget goals found</Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              ) : (
                filteredBudgetGoals.map((budgetGoal) => {
                  return (
                    <Grid2 item xs={12} md={6} lg={4} key={budgetGoal.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="h6">{budgetGoal.category}</Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Progress
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={calculateProgress(budgetGoal.amount)} 
                              sx={{ height: 8, borderRadius: 4, mt: 1 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2">
                                {getCurrencySymbol(currency)}{convertToDisplayValue(budgetGoal.amount, currency).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Period
                            </Typography>
                            <Typography variant="body1">
                              {new Date(budgetGoal.startDate).toLocaleDateString()} - {new Date(budgetGoal.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenEditDialog(budgetGoal)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDeleteDialog(budgetGoal)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid2>
                  );
                })
              )}
            </Grid2>
          )}
        </Container>
      </Box>

      {/* Add Budget Goal Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add Budget Goal</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={addFormik.handleSubmit} sx={{ mt: 2 }}>
            <Grid2 container spacing={2}>
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
              <Grid2 item xs={12} sm={6}>
                <TextField
                  error={!!(addFormik.touched.startDate && addFormik.errors.startDate)}
                  fullWidth
                  helperText={addFormik.touched.startDate && addFormik.errors.startDate}
                  label="Start Date"
                  name="startDate"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  type="date"
                  value={addFormik.values.startDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <TextField
                  error={!!(addFormik.touched.endDate && addFormik.errors.endDate)}
                  fullWidth
                  helperText={addFormik.touched.endDate && addFormik.errors.endDate}
                  label="End Date"
                  name="endDate"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  type="date"
                  value={addFormik.values.endDate}
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

      {/* Edit Budget Goal Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Budget Goal</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={editFormik.handleSubmit} sx={{ mt: 2 }}>
            <Grid2 container spacing={2}>
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
              <Grid2 item xs={12} sm={6}>
                <TextField
                  error={!!(editFormik.touched.startDate && editFormik.errors.startDate)}
                  fullWidth
                  helperText={editFormik.touched.startDate && editFormik.errors.startDate}
                  label="Start Date"
                  name="startDate"
                  onBlur={editFormik.handleBlur}
                  onChange={editFormik.handleChange}
                  type="date"
                  value={editFormik.values.startDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <TextField
                  error={!!(editFormik.touched.endDate && editFormik.errors.endDate)}
                  fullWidth
                  helperText={editFormik.touched.endDate && editFormik.errors.endDate}
                  label="End Date"
                  name="endDate"
                  onBlur={editFormik.handleBlur}
                  onChange={editFormik.handleChange}
                  type="date"
                  value={editFormik.values.endDate}
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

      {/* Delete Budget Goal Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Budget Goal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this budget goal? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteBudgetGoal} color="error" variant="contained">
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

export default BudgetGoalsPage; 