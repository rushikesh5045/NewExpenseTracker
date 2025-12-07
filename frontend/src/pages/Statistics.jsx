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
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  alpha,
  Fade,
  useMediaQuery,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Collapse,
  LinearProgress,
  Tooltip,
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
import TransactionListModal from "../components/statistics/TransactionListModal";

// Import chart components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ChartTooltip,
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

  // State for transaction list modal
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalTitle, setListModalTitle] = useState("");
  const [listModalTransactions, setListModalTransactions] = useState([]);

  // State for expanded category list
  const [expandedCategories, setExpandedCategories] = useState(false);

  // Handle tab change
  const handleViewChange = (event, newValue) => {
    if (newValue !== null) {
      setViewType(newValue);
    }
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

  // Open transaction list modal
  const openTransactionList = (title, transactionList) => {
    setListModalTitle(title);
    setListModalTransactions(transactionList);
    setListModalOpen(true);
  };

  // Close transaction list modal
  const closeTransactionList = () => {
    setListModalOpen(false);
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

  // Prepare category breakdown data
  const getCategoryBreakdown = (type = "expense") => {
    const categoryData = {};

    transactions.forEach((transaction) => {
      if (transaction.type === type) {
        const categoryId = transaction.category._id;
        const categoryName = transaction.category.name;
        const categoryColor = transaction.category.color || theme.palette.primary.main;

        if (!categoryData[categoryId]) {
          categoryData[categoryId] = {
            id: categoryId,
            name: categoryName,
            color: categoryColor,
            total: 0,
            transactions: [],
          };
        }

        categoryData[categoryId].total += transaction.amount;
        categoryData[categoryId].transactions.push(transaction);
      }
    });

    // Sort by total descending
    return Object.values(categoryData).sort((a, b) => b.total - a.total);
  };

  // Prepare data for Income vs Expense doughnut chart
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
          borderColor: [theme.palette.background.paper, theme.palette.background.paper],
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  };

  // Prepare data for Category Breakdown doughnut chart
  const prepareCategoryBreakdownData = () => {
    const breakdown = getCategoryBreakdown("expense");

    return {
      labels: breakdown.map((cat) => cat.name),
      datasets: [
        {
          data: breakdown.map((cat) => cat.total),
          backgroundColor: breakdown.map((cat) => cat.color),
          borderColor: breakdown.map(() => theme.palette.background.paper),
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  };

  // Prepare data for Trend Analysis line chart
  const prepareTrendData = () => {
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    let periodTransactions = [];

    if (viewType === "day") {
      // Group by hour for day view
      for (let i = 0; i < 24; i++) {
        labels.push(i.toString().padStart(2, '0') + ":00");

        const hourTransactions = transactions.filter((t) => {
          const date = new Date(t.date);
          return date.getHours() === i;
        });

        periodTransactions.push(hourTransactions);

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

        periodTransactions.push(dayTransactions);

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

        periodTransactions.push(monthTransactions);

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
      periodTransactions,
      datasets: [
        {
          label: t("income"),
          data: incomeData,
          borderColor: theme.palette.success.main,
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: theme.palette.success.main,
          pointBorderColor: theme.palette.background.paper,
          pointBorderWidth: 2,
        },
        {
          label: t("expense"),
          data: expenseData,
          borderColor: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: theme.palette.error.main,
          pointBorderColor: theme.palette.background.paper,
          pointBorderWidth: 2,
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
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
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
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          font: {
            family: '"Google Sans", "Roboto", sans-serif',
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
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
            size: 11,
          },
          callback: function (value) {
            if (value >= 1000) {
              return "₹" + (value / 1000).toFixed(0) + "k";
            }
            return "₹" + value;
          },
        },
        grid: {
          drawBorder: false,
          color: alpha(theme.palette.divider, 0.5),
        },
      },
      x: {
        ticks: {
          font: {
            family: '"Google Sans Text", "Roboto", sans-serif',
            size: 11,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: viewType === "month" ? 10 : 12,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Render category list item
  const renderCategoryItem = (category, maxTotal) => {
    const percentage = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;

    return (
      <ListItem
        key={category.id}
        button
        onClick={() => openTransactionList(category.name, category.transactions)}
        sx={{
          py: 1.5,
          px: 2,
          borderRadius: 2,
          mb: 1,
          backgroundColor: alpha(category.color, 0.04),
          "&:hover": {
            backgroundColor: alpha(category.color, 0.08),
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 44 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(category.color, 0.15),
              color: category.color,
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: '"Google Sans", "Roboto", sans-serif',
            }}
          >
            {category.name.substring(0, 2).toUpperCase()}
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
              >
                {category.name}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: category.color,
                }}
              >
                {formatCurrency(category.total)}
              </Typography>
            </Box>
          }
          secondary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(category.color, 0.1),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: category.color,
                    borderRadius: 3,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  color: "text.secondary",
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                {category.transactions.length} {category.transactions.length === 1 ? "item" : "items"}
              </Typography>
            </Box>
          }
          secondaryTypographyProps={{ component: "div" }}
        />
        <KeyboardArrowRightRoundedIcon
          sx={{ color: "text.secondary", ml: 1 }}
          fontSize="small"
        />
      </ListItem>
    );
  };

  const expenseBreakdown = getCategoryBreakdown("expense");
  const incomeBreakdown = getCategoryBreakdown("income");
  const maxExpenseTotal = expenseBreakdown.length > 0 ? expenseBreakdown[0].total : 0;
  const maxIncomeTotal = incomeBreakdown.length > 0 ? incomeBreakdown[0].total : 0;

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
              fontWeight: 500,
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

      {/* View Type Toggle */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewChange}
          aria-label="view type"
          fullWidth
          sx={{
            backgroundColor: alpha(theme.palette.action.selected, 0.04),
            borderRadius: 3,
            p: 0.5,
            "& .MuiToggleButtonGroup-grouped": {
              border: "none",
              borderRadius: "20px !important",
              mx: 0.5,
              py: 1,
              px: 3,
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "0.875rem",
              color: "text.secondary",
              "&.Mui-selected": {
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.primary.main,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                "&:hover": {
                  backgroundColor: theme.palette.background.paper,
                },
              },
              "&:hover": {
                backgroundColor: alpha(theme.palette.action.hover, 0.08),
              },
            },
          }}
        >
          <ToggleButton value="day">{t("day")}</ToggleButton>
          <ToggleButton value="month">{t("month")}</ToggleButton>
          <ToggleButton value="year">{t("year")}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Date Navigator */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
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
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>

        <Button
          onClick={handleOpenDatePicker}
          startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
          endIcon={<ArrowDropDownRoundedIcon />}
          sx={{
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: "text.primary",
            borderRadius: 20,
            px: 2,
            "&:hover": {
              backgroundColor: alpha(theme.palette.action.active, 0.04),
            },
          }}
        >
          {getFormattedDate()}
        </Button>

        <IconButton
          onClick={handleNext}
          sx={{
            color: "text.secondary",
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
          gap: 1,
        }}
      >
        {!isToday() && viewType === "day" && (
          <Chip
            icon={<TodayRoundedIcon />}
            label={t("today")}
            onClick={handleToday}
            variant="outlined"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
            }}
          />
        )}

        <Chip
          icon={<TuneRoundedIcon />}
          label={t("filters")}
          onClick={toggleFilters}
          variant={showFilters ? "filled" : "outlined"}
          color={showFilters ? "primary" : "default"}
          sx={{
            ml: "auto",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
          }}
        />
      </Box>

      {/* Filters */}
      <Collapse in={showFilters}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
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
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  mb: 1,
                  display: "block",
                }}
              >
                {t("transaction_type")}
              </Typography>
              <ToggleButtonGroup
                value={typeFilter}
                exclusive
                onChange={handleTypeFilterChange}
                size="small"
                fullWidth
                sx={{
                  "& .MuiToggleButtonGroup-grouped": {
                    borderRadius: "16px !important",
                    border: "1px solid " + theme.palette.divider,
                    textTransform: "none",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    py: 0.75,
                  },
                }}
              >
                <ToggleButton value="all">{t("all")}</ToggleButton>
                <ToggleButton
                  value="income"
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
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  mb: 1,
                  display: "block",
                }}
              >
                {t("category")}
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  sx={{
                    borderRadius: 4,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontSize: "0.875rem",
                  }}
                >
                  <MenuItem value="all">{t("all_categories")}</MenuItem>
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
      </Collapse>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {/* Income Card */}
            <Grid item xs={4}>
              <Paper
                elevation={0}
                onClick={() => openTransactionList(t("income"), transactions.filter(t => t.type === "income"))}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.success.main,
                    backgroundColor: alpha(theme.palette.success.main, 0.02),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    mb: 1.5,
                  }}
                >
                  <TrendingUpRoundedIcon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    display: "block",
                  }}
                >
                  {t("income")}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: isMobile ? "1rem" : "1.25rem",
                    color: theme.palette.success.main,
                  }}
                >
                  {formatCurrency(summary.income)}
                </Typography>
              </Paper>
            </Grid>

            {/* Expense Card */}
            <Grid item xs={4}>
              <Paper
                elevation={0}
                onClick={() => openTransactionList(t("expense"), transactions.filter(t => t.type === "expense"))}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.02),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    mb: 1.5,
                  }}
                >
                  <TrendingDownRoundedIcon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    display: "block",
                  }}
                >
                  {t("expense")}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: isMobile ? "1rem" : "1.25rem",
                    color: theme.palette.error.main,
                  }}
                >
                  {formatCurrency(summary.expense)}
                </Typography>
              </Paper>
            </Grid>

            {/* Balance Card */}
            <Grid item xs={4}>
              <Paper
                elevation={0}
                onClick={() => openTransactionList(t("balance"), transactions)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 1.5,
                  }}
                >
                  <AccountBalanceWalletRoundedIcon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    display: "block",
                  }}
                >
                  {t("balance")}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: isMobile ? "1rem" : "1.25rem",
                    color: summary.income - summary.expense >= 0 
                      ? theme.palette.success.main 
                      : theme.palette.error.main,
                  }}
                >
                  {formatCurrency(summary.income - summary.expense)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Income vs Expense Overview */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 1.5,
                }}
              >
                <PieChartRoundedIcon fontSize="small" />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                }}
              >
                {t("income_vs_expense")}
              </Typography>
            </Box>

            {summary.income === 0 && summary.expense === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                  flexDirection: "column",
                }}
              >
                <InsightsRoundedIcon
                  sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                />
                <Typography color="text.secondary">
                  {t("no_data_available")}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <Box sx={{ height: 180, position: "relative" }}>
                    <Doughnut
                      data={prepareIncomeExpenseData()}
                      options={doughnutChartOptions}
                    />
                    {/* Center text */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: '"Google Sans Text", "Roboto", sans-serif' }}
                      >
                        {t("savings_rate")}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          fontWeight: 600,
                          color: calculateSavingsRate() >= 0 
                            ? theme.palette.success.main 
                            : theme.palette.error.main,
                        }}
                      >
                        {calculateSavingsRate().toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Income row */}
                    <Box
                      onClick={() => openTransactionList(t("income"), transactions.filter(t => t.type === "income"))}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.success.main, 0.04),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: theme.palette.success.main,
                          mr: 1.5,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: '"Google Sans Text", "Roboto", sans-serif' }}
                        >
                          {t("income")}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"Google Sans", "Roboto", sans-serif',
                            fontWeight: 500,
                            color: theme.palette.success.main,
                          }}
                        >
                          {formatCurrency(summary.income)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={transactions.filter(t => t.type === "income").length + " items"}
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          fontSize: "0.75rem",
                        }}
                      />
                      <KeyboardArrowRightRoundedIcon sx={{ color: "text.secondary", ml: 0.5 }} />
                    </Box>

                    {/* Expense row */}
                    <Box
                      onClick={() => openTransactionList(t("expense"), transactions.filter(t => t.type === "expense"))}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.error.main, 0.04),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: theme.palette.error.main,
                          mr: 1.5,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: '"Google Sans Text", "Roboto", sans-serif' }}
                        >
                          {t("expense")}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: '"Google Sans", "Roboto", sans-serif',
                            fontWeight: 500,
                            color: theme.palette.error.main,
                          }}
                        >
                          {formatCurrency(summary.expense)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={transactions.filter(t => t.type === "expense").length + " items"}
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          fontSize: "0.75rem",
                        }}
                      />
                      <KeyboardArrowRightRoundedIcon sx={{ color: "text.secondary", ml: 0.5 }} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>

          {/* Expense by Category */}
          {expenseBreakdown.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      mr: 1.5,
                    }}
                  >
                    <BarChartRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {t("expense_by_category")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: '"Google Sans Text", "Roboto", sans-serif' }}
                    >
                      {expenseBreakdown.length} {t("categories")}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    color: theme.palette.error.main,
                  }}
                >
                  {formatCurrency(summary.expense)}
                </Typography>
              </Box>

              <List sx={{ py: 0 }}>
                {(expandedCategories ? expenseBreakdown : expenseBreakdown.slice(0, 5)).map((category) =>
                  renderCategoryItem(category, maxExpenseTotal)
                )}
              </List>

              {expenseBreakdown.length > 5 && (
                <Button
                  fullWidth
                  onClick={() => setExpandedCategories(!expandedCategories)}
                  endIcon={expandedCategories ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    color: "text.secondary",
                  }}
                >
                  {expandedCategories 
                    ? t("show_less") 
                    : t("show_all") + " (" + expenseBreakdown.length + ")"}
                </Button>
              )}
            </Paper>
          )}

          {/* Income by Category */}
          {incomeBreakdown.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      mr: 1.5,
                    }}
                  >
                    <TrendingUpRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {t("income_by_category")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: '"Google Sans Text", "Roboto", sans-serif' }}
                    >
                      {incomeBreakdown.length} {t("categories")}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    color: theme.palette.success.main,
                  }}
                >
                  {formatCurrency(summary.income)}
                </Typography>
              </Box>

              <List sx={{ py: 0 }}>
                {incomeBreakdown.slice(0, 5).map((category) =>
                  renderCategoryItem(category, maxIncomeTotal)
                )}
              </List>
            </Paper>
          )}

          {/* Trend Chart */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 1.5,
                }}
              >
                <InsightsRoundedIcon fontSize="small" />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                }}
              >
                {t("income_and_expense_trend")}
              </Typography>
            </Box>

            {transactions.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                  flexDirection: "column",
                }}
              >
                <InsightsRoundedIcon
                  sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                />
                <Typography color="text.secondary">
                  {t("no_trend_data_available")}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 280 }}>
                <Line data={prepareTrendData()} options={lineChartOptions} />
              </Box>
            )}
          </Paper>

          {/* All Transactions Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ReceiptLongRoundedIcon />}
            onClick={() => openTransactionList(t("all_transactions"), transactions)}
            sx={{
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "0.9375rem",
            }}
          >
            {t("view_all_transactions")} ({transactions.length})
          </Button>
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

      {/* Transaction List Modal */}
      <TransactionListModal
        open={listModalOpen}
        onClose={closeTransactionList}
        title={listModalTitle}
        transactions={listModalTransactions}
        onUpdate={() => {
          // Trigger a re-fetch by changing a dependency
          setCurrentDate(new Date(currentDate));
        }}
      />
    </Container>
  );
};

export default Statistics;
