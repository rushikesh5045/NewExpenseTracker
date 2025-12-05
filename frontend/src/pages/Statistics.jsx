// src/pages/Statistics.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Grid,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  getTransactions,
  getTransactionSummary,
  getCategories,
} from "../services/api";
import DatePickerDialog from "../components/dashboard/DatePickerDialog";
import LanguageSelector from "../components/common/LanguageSelector";

// Import chart components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const Statistics = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const theme = useTheme();

  // State for view type (day, month, year)
  const [viewType, setViewType] = useState("month");

  // State for current date
  const [currentDate, setCurrentDate] = useState(new Date());

  // State for date picker dialog
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // State for transactions and categories
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // State for summary data
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  // State for loading
  const [loading, setLoading] = useState(true);

  // State for filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Handle tab change
  const handleViewChange = (event, newValue) => {
    setViewType(newValue);
  };

  // Navigate to previous period
  const handlePrevious = () => {
    const newDate = new Date(currentDate);

    if (viewType === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === "year") {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }

    setCurrentDate(newDate);
  };

  // Navigate to next period
  const handleNext = () => {
    const newDate = new Date(currentDate);

    if (viewType === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === "year") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }

    setCurrentDate(newDate);
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Format the date based on view type
  const getFormattedDate = () => {
    const options = {
      day: { day: "numeric", month: "long", year: "numeric" },
      month: { month: "long", year: "numeric" },
      year: { year: "numeric" },
    };

    return new Intl.DateTimeFormat(
      localStorage.getItem("language") || "en",
      options[viewType]
    ).format(currentDate);
  };

  // Open date picker dialog
  const handleOpenDatePicker = () => {
    setDatePickerOpen(true);
  };

  // Close date picker dialog
  const handleCloseDatePicker = () => {
    setDatePickerOpen(false);
  };

  // Handle date change from date picker
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setTypeFilter(newValue);
    }
  };

  // Check if current date is today
  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build date filter based on viewType and currentDate
        const dateFilter = {};

        if (viewType === "day") {
          const startOfDay = new Date(currentDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(currentDate);
          endOfDay.setHours(23, 59, 59, 999);

          dateFilter.startDate = startOfDay.toISOString();
          dateFilter.endDate = endOfDay.toISOString();
        } else if (viewType === "month") {
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );

          dateFilter.startDate = startOfMonth.toISOString();
          dateFilter.endDate = endOfMonth.toISOString();
        } else if (viewType === "year") {
          const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
          const endOfYear = new Date(
            currentDate.getFullYear(),
            11,
            31,
            23,
            59,
            59,
            999
          );

          dateFilter.startDate = startOfYear.toISOString();
          dateFilter.endDate = endOfYear.toISOString();
        }

        // Apply type filter if not 'all'
        if (typeFilter !== "all") {
          dateFilter.type = typeFilter;
        }

        // Apply category filter if not 'all'
        if (categoryFilter !== "all") {
          dateFilter.category = categoryFilter;
        }

        // Fetch transactions, summary, and categories in parallel
        const [transactionsResponse, summaryResponse, categoriesResponse] =
          await Promise.all([
            getTransactions(dateFilter),
            getTransactionSummary(dateFilter),
            getCategories(),
          ]);

        setTransactions(transactionsResponse.data);
        setSummary(summaryResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Error fetching statistics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewType, currentDate, typeFilter, categoryFilter]);

  // Prepare data for Income vs Expense pie chart
  const prepareIncomeExpenseData = () => {
    return {
      labels: [t("Income"), t("Expense")],
      datasets: [
        {
          data: [summary.income, summary.expense],
          backgroundColor: [
            theme.palette.success.main,
            theme.palette.error.main,
          ],
          borderColor: [theme.palette.success.main, theme.palette.error.main],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for Category Breakdown pie chart
  const prepareCategoryBreakdownData = () => {
    // Group transactions by category
    const categoryData = {};
    const categoryColors = {};

    transactions.forEach((transaction) => {
      if (
        transaction.type === "expense" ||
        typeFilter === "all" ||
        typeFilter === "expense"
      ) {
        const categoryId = transaction.category._id;
        const categoryName = transaction.category.name;
        const amount = transaction.amount;

        if (!categoryData[categoryId]) {
          categoryData[categoryId] = {
            name: categoryName,
            total: 0,
          };
          categoryColors[categoryId] =
            transaction.category.color ||
            "#" + Math.floor(Math.random() * 16777215).toString(16);
        }

        categoryData[categoryId].total += amount;
      }
    });

    const labels = Object.values(categoryData).map((cat) => cat.name);
    const data = Object.values(categoryData).map((cat) => cat.total);
    const backgroundColor = Object.keys(categoryData).map(
      (id) => categoryColors[id]
    );

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor,
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for Trend Analysis line chart
  const prepareTrendData = () => {
    let labels = [];
    let incomeData = [];
    let expenseData = [];

    if (viewType === "day") {
      // Group by hour for day view
      for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);

        const hourTransactions = transactions.filter((t) => {
          const date = new Date(t.date);
          return date.getHours() === i;
        });

        const hourIncome = hourTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const hourExpense = hourTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(hourIncome);
        expenseData.push(hourExpense);
      }
    } else if (viewType === "month") {
      // Group by day for month view
      const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(i.toString());

        const dayTransactions = transactions.filter((t) => {
          const date = new Date(t.date);
          return date.getDate() === i;
        });

        const dayIncome = dayTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const dayExpense = dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(dayIncome);
        expenseData.push(dayExpense);
      }
    } else if (viewType === "year") {
      // Group by month for year view
      const monthNames = Array.from({ length: 12 }, (_, i) => {
        return new Date(2000, i, 1).toLocaleString(
          localStorage.getItem("language") || "en",
          { month: "short" }
        );
      });

      labels = monthNames;

      for (let i = 0; i < 12; i++) {
        const monthTransactions = transactions.filter((t) => {
          const date = new Date(t.date);
          return date.getMonth() === i;
        });

        const monthIncome = monthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const monthExpense = monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(monthIncome);
        expenseData.push(monthExpense);
      }
    }

    return {
      labels,
      datasets: [
        {
          label: t("Income"),
          data: incomeData,
          borderColor: theme.palette.success.main,
          backgroundColor: theme.palette.success.main + "40", // 40 = 25% opacity
          fill: true,
          tension: 0.4,
        },
        {
          label: t("Expense"),
          data: expenseData,
          borderColor: theme.palette.error.main,
          backgroundColor: theme.palette.error.main + "40", // 40 = 25% opacity
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare data for Top Categories bar chart
  const prepareTopCategoriesData = () => {
    // Group transactions by category
    const categoryData = {};

    transactions.forEach((transaction) => {
      if (transaction.type === "expense" || typeFilter === "expense") {
        const categoryId = transaction.category._id;
        const categoryName = transaction.category.name;
        const amount = transaction.amount;

        if (!categoryData[categoryId]) {
          categoryData[categoryId] = {
            name: categoryName,
            total: 0,
          };
        }

        categoryData[categoryId].total += amount;
      }
    });

    // Sort categories by total and take top 5
    const topCategories = Object.values(categoryData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const labels = topCategories.map((cat) => cat.name);
    const data = topCategories.map((cat) => cat.total);

    return {
      labels,
      datasets: [
        {
          label: t("Expense Amount"),
          data,
          backgroundColor: theme.palette.error.main,
          borderColor: theme.palette.error.main,
          borderWidth: 1,
        },
      ],
    };
  };

  // Calculate savings rate
  const calculateSavingsRate = () => {
    if (summary.income === 0) return 0;
    return ((summary.income - summary.expense) / summary.income) * 100;
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: t("Income vs Expense Trend"),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: t("Top Expense Categories"),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container maxWidth="false" sx={{ pb: 7 }}>
      {/* Header with Language Selector */}
      <Box
        sx={{
          pt: 2,
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" component="h1" fontWeight="medium">
            {t("Statistics")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("Financial insights")}
          </Typography>
        </Box>
        <LanguageSelector />
      </Box>

      {/* View Type Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: theme.shape.borderRadius,
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={viewType}
          onChange={handleViewChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="statistics view tabs"
        >
          <Tab value="day" label={t("Day")} />
          <Tab value="month" label={t("Month")} />
          <Tab value="year" label={t("Year")} />
        </Tabs>
      </Paper>

      {/* Date Navigator */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <IconButton
          onClick={handlePrevious}
          color="primary"
          sx={{ color: "text.secondary" }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={handleOpenDatePicker}
        >
          <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            {getFormattedDate()}
          </Typography>
        </Box>

        <IconButton
          onClick={handleNext}
          color="primary"
          sx={{ color: "text.secondary" }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Today Button (only show if not on today) */}
      {!isToday() && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            size="small"
            startIcon={<TodayIcon />}
            onClick={handleToday}
            variant="outlined"
            sx={{ borderRadius: 20, px: 2 }}
          >
            {t("Today")}
          </Button>
        </Box>
      )}

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: theme.shape.borderRadius,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FilterIcon fontSize="small" sx={{ mr: 1 }} />
          {t("Filters")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mt: 1,
          }}
        >
          {/* Transaction Type Filter */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("Transaction Type")}
            </Typography>
            <ToggleButtonGroup
              value={typeFilter}
              exclusive
              onChange={handleTypeFilterChange}
              aria-label="transaction type filter"
              size="small"
              fullWidth
            >
              <ToggleButton value="all" aria-label="all transactions">
                {t("All")}
              </ToggleButton>
              <ToggleButton value="income" aria-label="income only">
                {t("Income")}
              </ToggleButton>
              <ToggleButton value="expense" aria-label="expenses only">
                {t("Expense")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Category Filter */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("Category")}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                displayEmpty
              >
                <MenuItem value="all">{t("All Categories")}</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: "100%",
                  borderRadius: theme.shape.borderRadius,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("Income")}
                </Typography>
                <Typography
                  variant="h6"
                  color="success.main"
                  fontWeight="medium"
                >
                  ₹{summary.income.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: "100%",
                  borderRadius: theme.shape.borderRadius,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("Expense")}
                </Typography>
                <Typography variant="h6" color="error.main" fontWeight="medium">
                  ₹{summary.expense.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: "100%",
                  borderRadius: theme.shape.borderRadius,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("Savings Rate")}
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    calculateSavingsRate() >= 0 ? "success.main" : "error.main"
                  }
                  fontWeight="medium"
                >
                  {calculateSavingsRate().toFixed(0)}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Income vs Expense Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: theme.shape.borderRadius,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <CardHeader
                  title={t("Income vs Expense")}
                  titleTypographyProps={{ variant: "subtitle1" }}
                  avatar={<PieChartIcon color="primary" />}
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {summary.income === 0 && summary.expense === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {t("No data available")}
                      </Typography>
                    </Box>
                  ) : (
                    <Pie
                      data={prepareIncomeExpenseData()}
                      options={pieChartOptions}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Category Breakdown Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: theme.shape.borderRadius,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <CardHeader
                  title={t("Expense by Category")}
                  titleTypographyProps={{ variant: "subtitle1" }}
                  avatar={<PieChartIcon color="primary" />}
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {summary.expense === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {t("No expense data available")}
                      </Typography>
                    </Box>
                  ) : (
                    <Pie
                      data={prepareCategoryBreakdownData()}
                      options={pieChartOptions}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Trend Analysis Line Chart */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: theme.shape.borderRadius,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardHeader
                  title={t("Income and Expense Trend")}
                  titleTypographyProps={{ variant: "subtitle1" }}
                  avatar={<TrendingUpIcon color="primary" />}
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {transactions.length === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {t("No trend data available")}
                      </Typography>
                    </Box>
                  ) : (
                    <Line
                      data={prepareTrendData()}
                      options={lineChartOptions}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Categories Bar Chart */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: theme.shape.borderRadius,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardHeader
                  title={t("Top Expense Categories")}
                  titleTypographyProps={{ variant: "subtitle1" }}
                  avatar={<BarChartIcon color="primary" />}
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {summary.expense === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {t("No expense data available")}
                      </Typography>
                    </Box>
                  ) : (
                    <Bar
                      data={prepareTopCategoriesData()}
                      options={barChartOptions}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Date Picker Dialog */}
      <DatePickerDialog
        open={datePickerOpen}
        onClose={handleCloseDatePicker}
        selectedDate={currentDate}
        onDateChange={handleDateChange}
        viewType={viewType}
      />
    </Container>
  );
};

export default Statistics;
