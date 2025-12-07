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
  Chip,
  alpha,
  Fade,
  useMediaQuery,
  Button,
} from "@mui/material";
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

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  const [showFilters, setShowFilters] = useState(false);

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

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(localStorage.getItem("language") || "en", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      labels: [t("income"), t("expense")],
      datasets: [
        {
          data: [summary.income, summary.expense],
          backgroundColor: [
            theme.palette.success.main,
            theme.palette.error.main,
          ],
          borderColor: [
            alpha(theme.palette.success.main, 0.8),
            alpha(theme.palette.error.main, 0.8),
          ],
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
          borderColor: backgroundColor.map((color) => alpha(color, 0.8)),
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
          label: t("income"),
          data: incomeData,
          borderColor: theme.palette.success.main,
          backgroundColor: alpha(theme.palette.success.main, 0.2),
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: t("expense"),
          data: expenseData,
          borderColor: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.2),
          fill: true,
          tension: 0.4,
          borderWidth: 2,
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
          label: t("expense_amount"),
          data,
          backgroundColor: alpha(theme.palette.error.main, 0.8),
          borderColor: theme.palette.error.main,
          borderWidth: 1,
          borderRadius: 4,
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
        labels: {
          font: {
            family: '"Google Sans", "Roboto", sans-serif',
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        titleFont: {
          family: '"Google Sans", "Roboto", sans-serif',
          size: 14,
        },
        bodyFont: {
          family: '"Google Sans Text", "Roboto", sans-serif',
          size: 13,
        },
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== undefined) {
              label += formatCurrency(context.parsed);
            }
            return label;
          },
        },
      },
    },
    cutout: "60%",
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          font: {
            family: '"Google Sans", "Roboto", sans-serif',
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        titleFont: {
          family: '"Google Sans", "Roboto", sans-serif',
          size: 14,
        },
        bodyFont: {
          family: '"Google Sans Text", "Roboto", sans-serif',
          size: 13,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== undefined) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: '"Google Sans Text", "Roboto", sans-serif',
          },
          callback: function (value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + "k";
            }
            return value;
          },
        },
        grid: {
          drawBorder: false,
          color: alpha(theme.palette.text.secondary, 0.1),
        },
      },
      x: {
        ticks: {
          font: {
            family: '"Google Sans Text", "Roboto", sans-serif',
          },
          maxRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
      },
      line: {
        tension: 0.3,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleFont: {
          family: '"Google Sans", "Roboto", sans-serif',
          size: 14,
        },
        bodyFont: {
          family: '"Google Sans Text", "Roboto", sans-serif',
          size: 13,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== undefined) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: '"Google Sans Text", "Roboto", sans-serif',
          },
          callback: function (value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + "k";
            }
            return value;
          },
        },
        grid: {
          drawBorder: false,
          color: alpha(theme.palette.text.secondary, 0.1),
        },
      },
      x: {
        ticks: {
          font: {
            family: '"Google Sans Text", "Roboto", sans-serif',
          },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
    barThickness: 30,
    borderRadius: 4,
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 10 }}>
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
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 400,
              fontSize: "1.5rem",
            }}
          >
            {t("analytics")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            }}
          >
            {t("financial_insights")}
          </Typography>
        </Box>
        <LanguageSelector />
      </Box>

      {/* View Type Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          mb: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={viewType}
          onChange={handleViewChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="statistics view tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "0.875rem",
              minHeight: 48,
            },
            "& .MuiTabs-indicator": {
              height: 3,
            },
          }}
        >
          <Tab value="day" label={t("day")} />
          <Tab value="month" label={t("month")} />
          <Tab value="year" label={t("year")} />
        </Tabs>
      </Paper>

      {/* Date Navigator */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton
          onClick={handlePrevious}
          sx={{
            color: "text.secondary",
            backgroundColor: alpha(theme.palette.action.active, 0.04),
            "&:hover": {
              backgroundColor: alpha(theme.palette.action.active, 0.08),
            },
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            px: 2,
            py: 1,
            borderRadius: 20,
            "&:hover": {
              backgroundColor: alpha(theme.palette.action.active, 0.04),
            },
          }}
          onClick={handleOpenDatePicker}
        >
          <CalendarTodayRoundedIcon
            fontSize="small"
            color="primary"
            sx={{ mr: 1 }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
            }}
          >
            {getFormattedDate()}
          </Typography>
          <ArrowDropDownRoundedIcon color="action" />
        </Box>

        <IconButton
          onClick={handleNext}
          sx={{
            color: "text.secondary",
            backgroundColor: alpha(theme.palette.action.active, 0.04),
            "&:hover": {
              backgroundColor: alpha(theme.palette.action.active, 0.08),
            },
          }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
      </Paper>

      {/* Today Button and Filters Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        {!isToday() && (
          <Button
            size="medium"
            startIcon={<TodayRoundedIcon />}
            onClick={handleToday}
            variant="outlined"
            sx={{
              borderRadius: 20,
              px: 2,
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
            }}
          >
            {t("today")}
          </Button>
        )}

        <Button
          size="medium"
          startIcon={<TuneRoundedIcon />}
          onClick={toggleFilters}
          variant="outlined"
          sx={{
            borderRadius: 20,
            px: 2,
            ml: "auto",
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
          }}
        >
          {t("filters")}
        </Button>
      </Box>

      {/* Filters */}
      <Fade in={showFilters}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            display: showFilters ? "block" : "none",
          }}
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              mb: 2,
            }}
          >
            <FilterListRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            {t("filters")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            {/* Transaction Type Filter */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  mb: 1,
                }}
              >
                {t("transaction_type")}
              </Typography>
              <ToggleButtonGroup
                value={typeFilter}
                exclusive
                onChange={handleTypeFilterChange}
                aria-label="transaction type filter"
                size="small"
                fullWidth
                sx={{
                  "& .MuiToggleButtonGroup-grouped": {
                    borderRadius: "20px !important",
                    mx: 0,
                    border: `1px solid ${theme.palette.divider}`,
                    "&.Mui-selected": {
                      boxShadow: "none",
                    },
                    textTransform: "none",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  },
                }}
              >
                <ToggleButton value="all" aria-label="all transactions">
                  {t("all")}
                </ToggleButton>
                <ToggleButton
                  value="income"
                  aria-label="income only"
                  sx={{
                    "&.Mui-selected": {
                      color: theme.palette.success.main,
                      backgroundColor: alpha(theme.palette.success.main, 0.08),
                    },
                  }}
                >
                  {t("income")}
                </ToggleButton>
                <ToggleButton
                  value="expense"
                  aria-label="expenses only"
                  sx={{
                    "&.Mui-selected": {
                      color: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  {t("expense")}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Category Filter */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  mb: 1,
                }}
              >
                {t("category")}
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  displayEmpty
                  sx={{
                    borderRadius: 20,
                    height: 40,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        mt: 0.5,
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  <MenuItem
                    value="all"
                    sx={{
                      fontFamily: '"Google Sans", "Roboto", sans-serif',
                      borderRadius: 1,
                    }}
                  >
                    {t("all_categories")}
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem
                      key={category._id}
                      value={category._id}
                      sx={{
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                        borderRadius: 1,
                      }}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Income Card */}
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: theme.palette.success.main,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    mb: 1,
                  }}
                >
                  <TrendingUpRoundedIcon />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  }}
                >
                  {t("income")}
                </Typography>
                <Typography
                  variant="h6"
                  color="success.main"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {formatCurrency(summary.income)}
                </Typography>
              </Paper>
            </Grid>

            {/* Expense Card */}
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: theme.palette.error.main,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    mb: 1,
                  }}
                >
                  <AccountBalanceWalletRoundedIcon />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  }}
                >
                  {t("expense")}
                </Typography>
                <Typography
                  variant="h6"
                  color="error.main"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {formatCurrency(summary.expense)}
                </Typography>
              </Paper>
            </Grid>

            {/* Savings Rate Card */}
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor:
                      calculateSavingsRate() >= 0
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      calculateSavingsRate() >= 0
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.error.main, 0.1),
                    color:
                      calculateSavingsRate() >= 0
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                    mb: 1,
                  }}
                >
                  <SavingsRoundedIcon />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  }}
                >
                  {t("savings_rate")}
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    calculateSavingsRate() >= 0 ? "success.main" : "error.main"
                  }
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  }}
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
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <CardHeader
                  title={t("income_vs_expense")}
                  titleTypographyProps={{
                    variant: "subtitle1",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  }}
                  avatar={
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <PieChartRoundedIcon fontSize="small" />
                    </Box>
                  }
                  sx={{ px: 3, py: 2 }}
                />
                <Divider />
                <CardContent sx={{ height: 300, p: 3 }}>
                  {summary.income === 0 && summary.expense === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: alpha(
                            theme.palette.action.active,
                            0.08
                          ),
                          color: theme.palette.text.secondary,
                          mb: 2,
                        }}
                      >
                        <InsightsRoundedIcon />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                        }}
                      >
                        {t("no_data_available")}
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
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <CardHeader
                  title={t("expense_by_category")}
                  titleTypographyProps={{
                    variant: "subtitle1",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  }}
                  avatar={
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <PieChartRoundedIcon fontSize="small" />
                    </Box>
                  }
                  sx={{ px: 3, py: 2 }}
                />
                <Divider />
                <CardContent sx={{ height: 300, p: 3 }}>
                  {summary.expense === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: alpha(
                            theme.palette.action.active,
                            0.08
                          ),
                          color: theme.palette.text.secondary,
                          mb: 2,
                        }}
                      >
                        <InsightsRoundedIcon />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                        }}
                      >
                        {t("no_expense_data_available")}
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
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <CardHeader
                  title={t("income_and_expense_trend")}
                  titleTypographyProps={{
                    variant: "subtitle1",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  }}
                  avatar={
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <TrendingUpRoundedIcon fontSize="small" />
                    </Box>
                  }
                  sx={{ px: 3, py: 2 }}
                />
                <Divider />
                <CardContent sx={{ height: 350, p: 3 }}>
                  {transactions.length === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: alpha(
                            theme.palette.action.active,
                            0.08
                          ),
                          color: theme.palette.text.secondary,
                          mb: 2,
                        }}
                      >
                        <InsightsRoundedIcon />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                        }}
                      >
                        {t("no_trend_data_available")}
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
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <CardHeader
                  title={t("top_expense_categories")}
                  titleTypographyProps={{
                    variant: "subtitle1",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                  }}
                  avatar={
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <BarChartRoundedIcon fontSize="small" />
                    </Box>
                  }
                  sx={{ px: 3, py: 2 }}
                />
                <Divider />
                <CardContent sx={{ height: 350, p: 3 }}>
                  {summary.expense === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: alpha(
                            theme.palette.action.active,
                            0.08
                          ),
                          color: theme.palette.text.secondary,
                          mb: 2,
                        }}
                      >
                        <InsightsRoundedIcon />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                        }}
                      >
                        {t("no_expense_data_available")}
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
