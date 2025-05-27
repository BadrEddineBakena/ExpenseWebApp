import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  SelectChangeEvent,
  Grid as MuiGrid,
} from '@mui/material';
import api from '@/services/axiosInstance';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getCurrencySymbol, convertToDisplayValue } from '../../utils/currency';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ReportData {
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
  expensesByMonth: Array<{
    month: string;
    amount: number;
  }>;
  incomesBySource: Array<{
    source: string;
    amount: number;
  }>;
  incomesByMonth: Array<{
    month: string;
    amount: number;
  }>;
  savingsByMonth: Array<{
    month: string;
    amount: number;
  }>;
  totalExpenses: number;
  totalIncomes: number;
  totalSavings: number;
  currency: string;
}

const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const { currency } = useCurrency();

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // Compose period string for backend
      let periodString = period;
      if (period !== 'custom') {
        const start = new Date(startDate);
        periodString = start.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      const response = await api.post('/reports', {
        startDate,
        endDate,
        period: periodString
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Transform backend response to flat structure for charts/cards
      const data = response.data;
      const details = data.details || {};
      // Expenses by Category
      const expensesByCategory = details.expensesByCategory
        ? Object.entries(details.expensesByCategory).map(([category, amount]) => ({ category, amount }))
        : [];
      // Incomes by Source
      const incomesBySource = details.incomes
        ? details.incomes.reduce((acc, inc) => {
            const source = inc.source || 'Other';
            const found = acc.find(i => i.source === source);
            if (found) found.amount += inc.amount;
            else acc.push({ source, amount: inc.amount });
            return acc;
          }, [])
        : [];
      // Expenses by Month
      const expensesByMonth = details.expenses
        ? details.expenses.reduce((acc, exp) => {
            const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            const found = acc.find(i => i.month === month);
            if (found) found.amount += exp.amount;
            else acc.push({ month, amount: exp.amount });
            return acc;
          }, [])
        : [];
      // Incomes by Month
      const incomesByMonth = details.incomes
        ? details.incomes.reduce((acc, inc) => {
            const month = new Date(inc.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            const found = acc.find(i => i.month === month);
            if (found) found.amount += inc.amount;
            else acc.push({ month, amount: inc.amount });
            return acc;
          }, [])
        : [];
      // Savings by Month
      const savingsByMonth = expensesByMonth.map((exp, idx) => {
        const inc = incomesByMonth.find(i => i.month === exp.month);
        return {
          month: exp.month,
          amount: (inc ? inc.amount : 0) - exp.amount
        };
      });
      setReportData({
        totalExpenses: data.totalExpense ?? 0,
        totalIncomes: data.totalIncome ?? 0,
        totalSavings: data.balance ?? 0,
        expensesByCategory,
        expensesByMonth,
        incomesBySource,
        incomesByMonth,
        savingsByMonth,
        currency: 'MAD' // Or get from user profile
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch report data');
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handlePeriodChange = (event: SelectChangeEvent) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
    
    // Adjust date range based on period
    const today = new Date();
    let newStartDate = new Date();
    
    if (newPeriod === 'week') {
      newStartDate = new Date(today.setDate(today.getDate() - 7));
    } else if (newPeriod === 'month') {
      newStartDate = new Date(today.setMonth(today.getMonth() - 1));
    } else if (newPeriod === 'quarter') {
      newStartDate = new Date(today.setMonth(today.getMonth() - 3));
    } else if (newPeriod === 'year') {
      newStartDate = new Date(today.setFullYear(today.getFullYear() - 1));
    }
    
    setStartDate(newStartDate.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  const expensesByCategory = reportData?.expensesByCategory || [];
  const expensesByMonth = reportData?.expensesByMonth || [];
  const incomesBySource = reportData?.incomesBySource || [];
  const incomesByMonth = reportData?.incomesByMonth || [];
  const savingsByMonth = reportData?.savingsByMonth || [];

  const expensesCategoryChartOptions: ApexOptions = {
    chart: {
      type: 'pie'
    },
    labels: expensesByCategory.map(item => item.category),
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

  const expensesCategorySeries = expensesByCategory.map(item => item.amount);

  const incomeSourceChartOptions: ApexOptions = {
    chart: {
      type: 'pie'
    },
    labels: incomesBySource.map(item => item.source),
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

  const incomeSourceSeries = incomesBySource.map(item => item.amount);

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
      categories: expensesByMonth.map(item => item.month)
    },
    yaxis: {
      labels: {
        formatter: (value) => `${getCurrencySymbol(currency)}${convertToDisplayValue(value, currency)}`
      }
    },
    colors: ['#EF4444', '#10B981', '#4F46E5'],
    legend: {
      position: 'top'
    }
  };

  const monthlyChartSeries = [
    {
      name: 'Expenses',
      data: expensesByMonth.map(item => convertToDisplayValue(item.amount, currency))
    },
    {
      name: 'Incomes',
      data: incomesByMonth.map(item => convertToDisplayValue(item.amount, currency))
    },
    {
      name: 'Savings',
      data: savingsByMonth.map(item => convertToDisplayValue(item.amount, currency))
    }
  ];

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
        <title>Reports | ExpenseApp</title>
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
            Financial Reports
          </Typography>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <MuiGrid container spacing={2} alignItems="center">
                <MuiGrid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={period}
                      label="Period"
                      onChange={handlePeriodChange}
                    >
                      <MenuItem value="week">Last Week</MenuItem>
                      <MenuItem value="month">Last Month</MenuItem>
                      <MenuItem value="quarter">Last Quarter</MenuItem>
                      <MenuItem value="year">Last Year</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </MuiGrid>
                {period === 'custom' && (
                  <>
                    <MuiGrid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </MuiGrid>
                    <MuiGrid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </MuiGrid>
                  </>
                )}
              </MuiGrid>
            </CardContent>
          </Card>

          <MuiGrid container spacing={3}>
            {/* Summary Cards */}
            <MuiGrid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Total Expenses
                  </Typography>
                  <Typography variant="h4">
                    {getCurrencySymbol(currency)}{convertToDisplayValue(reportData?.totalExpenses ?? 0, currency).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </MuiGrid>
            
            <MuiGrid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Total Incomes
                  </Typography>
                  <Typography variant="h4">
                    {getCurrencySymbol(currency)}{convertToDisplayValue(reportData?.totalIncomes ?? 0, currency).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </MuiGrid>
            
            <MuiGrid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Total Savings
                  </Typography>
                  <Typography variant="h4">
                    {getCurrencySymbol(currency)}{convertToDisplayValue(reportData?.totalSavings ?? 0, currency).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </MuiGrid>

            {/* Monthly Overview Chart */}
            <MuiGrid item xs={12}>
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
            </MuiGrid>

            {/* Expenses by Category Chart */}
            <MuiGrid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Expenses by Category
                  </Typography>
                  <Chart
                    options={expensesCategoryChartOptions}
                    series={expensesCategorySeries}
                    type="pie"
                    height={350}
                  />
                </CardContent>
              </Card>
            </MuiGrid>

            {/* Income by Source Chart */}
            <MuiGrid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Income by Source
                  </Typography>
                  <Chart
                    options={incomeSourceChartOptions}
                    series={incomeSourceSeries}
                    type="pie"
                    height={350}
                  />
                </CardContent>
              </Card>
            </MuiGrid>
          </MuiGrid>
        </Container>
      </Box>
    </>
  );
};

export default ReportsPage; 