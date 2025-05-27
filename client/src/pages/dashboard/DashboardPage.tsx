import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SavingsIcon from '@mui/icons-material/Savings';
import api from '@/services/axiosInstance';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Grid as Grid2 } from '@mui/material';
import { getCurrencySymbol, convertToDisplayValue } from '../../utils/currency';
import { useCurrency } from '@/contexts/CurrencyContext';

interface DashboardSummary {
  totalExpenses: number;
  totalIncomes: number;
  totalSavings: number;
  recentExpenses: Array<{
    id: number;
    amount: number;
    description: string;
    date: string;
    category: string;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
  monthlyData: Array<{
    month: string;
    expenses: number;
    incomes: number;
  }>;
}

const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(response.data);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currency]); // Refetch when currency changes

  if (!summary || !summary.monthlyData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Typography color="error">Dashboard data is unavailable.</Typography>
      </Box>
    );
  }

  const monthlyChartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: summary.monthlyData.map(item => item.month)
    },
    yaxis: {
      labels: {
        formatter: (value) => `${getCurrencySymbol(currency)}${convertToDisplayValue(value, currency)}`
      }
    },
    colors: ['#4F46E5', '#10B981'],
    legend: {
      position: 'top'
    }
  };

  const monthlyChartSeries = [
    {
      name: 'Expenses',
      data: summary.monthlyData.map(item => convertToDisplayValue(item.expenses, currency))
    },
    {
      name: 'Incomes',
      data: summary.monthlyData.map(item => convertToDisplayValue(item.incomes, currency))
    }
  ];

  const pieChartOptions: ApexOptions = {
    chart: {
      type: 'pie'
    },
    labels: summary.expensesByCategory.map(item => item.category),
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const pieChartSeries = summary.expensesByCategory.map(item => convertToDisplayValue(item.amount, currency));

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | ExpenseApp</title>
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
          <Typography variant="h4" sx={{ mb: 4 }}>
            Dashboard
          </Typography>
          
          <Grid2 container spacing={3}>
            {/* Summary Cards */}
            <Grid2 item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                  >
                    <div>
                      <Typography
                        color="text.secondary"
                        variant="overline"
                      >
                        Total Expenses
                      </Typography>
                      <Typography variant="h4">
                        {getCurrencySymbol(currency)}{convertToDisplayValue(summary?.totalExpenses ?? 0, currency).toFixed(2)}
                      </Typography>
                    </div>
                    <Avatar
                      sx={{
                        backgroundColor: 'error.main',
                        height: 56,
                        width: 56
                      }}
                    >
                      <ReceiptIcon />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid2>
            
            <Grid2 item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                  >
                    <div>
                      <Typography
                        color="text.secondary"
                        variant="overline"
                      >
                        Total Incomes
                      </Typography>
                      <Typography variant="h4">
                        {getCurrencySymbol(currency)}{convertToDisplayValue(summary?.totalIncomes ?? 0, currency).toFixed(2)}
                      </Typography>
                    </div>
                    <Avatar
                      sx={{
                        backgroundColor: 'success.main',
                        height: 56,
                        width: 56
                      }}
                    >
                      <AttachMoneyIcon />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid2>
            
            <Grid2 item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                  >
                    <div>
                      <Typography
                        color="text.secondary"
                        variant="overline"
                      >
                        Total Savings
                      </Typography>
                      <Typography variant="h4">
                        {getCurrencySymbol(currency)}{convertToDisplayValue(summary?.totalSavings ?? 0, currency).toFixed(2)}
                      </Typography>
                    </div>
                    <Avatar
                      sx={{
                        backgroundColor: 'primary.main',
                        height: 56,
                        width: 56
                      }}
                    >
                      <SavingsIcon />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid2>

            {/* Charts */}
            <Grid2 item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Monthly Overview
                  </Typography>
                  <Chart
                    options={monthlyChartOptions}
                    series={monthlyChartSeries}
                    type="line"
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid2>
            
            <Grid2 item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Expenses by Category
                  </Typography>
                  <Chart
                    options={pieChartOptions}
                    series={pieChartSeries}
                    type="pie"
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid2>

            {/* Recent Expenses */}
            <Grid2 item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Expenses
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Description</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Category</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Date</th>
                          <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary?.recentExpenses.map((expense) => (
                          <tr key={expense.id}>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{expense.description}</td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{expense.category}</td>
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{new Date(expense.date).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                              {getCurrencySymbol(currency)}{convertToDisplayValue(expense.amount, currency).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage; 