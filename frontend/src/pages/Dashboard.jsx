import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Fab,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  alpha,
  Fade,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/dashboard/SummaryCard";
import TransactionList from "../components/dashboard/TransactionList";
import DownloadMenu from "../components/dashboard/DownloadMenu";
import LanguageSelector from "../components/common/LanguageSelector";
import AddTransactionModal from "../components/transactions/AddTransactionModal";
import DatePickerDialog from "../components/dashboard/DatePickerDialog";
import { getTransactions, getTransactionSummary } from "../services/api";

// Google-style rounded icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

const Dashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for view type (day, month, year)
  const [viewType, setViewType] = useState("month");

  // State for current date
  const [currentDate, setCurrentDate] = useState(new Date());

  // State for transactions
  const [transactions, setTransactions] = useState([]);

  // State for monthly transactions (for year view)
  const [monthlyTransactions, setMonthlyTransactions] = useState({});

  // State for summary data
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  // State for monthly summaries (for year view)
  const [monthlySummaries, setMonthlySummaries] = useState({});

  // State for loading
  const [loading, setLoading] = useState(true);

  // State for add transaction modal
  const [addModalOpen, setAddModalOpen] = useState(false);

  // State for date picker dialog
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // State for expanded month in year view
  const [expandedMonth, setExpandedMonth] = useState(null);

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handle tab change
  const handleViewChange = (event, newValue) => {
    setViewType(newValue);
    // Reset expanded month when changing views
    setExpandedMonth(null);
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
    // Reset expanded month when changing date
    setExpandedMonth(null);
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
    // Reset expanded month when changing date
    setExpandedMonth(null);
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentDate(new Date());
    // Reset expanded month when navigating to today
    setExpandedMonth(null);
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(localStorage.getItem("language") || "en", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    // Reset expanded month when changing date
    setExpandedMonth(null);
  };

  // Handle opening the add transaction modal
  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  // Handle closing the add transaction modal
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Handle accordion expansion change
  const handleAccordionChange = (month) => (event, isExpanded) => {
    setExpandedMonth(isExpanded ? month : null);
  };

  // Handle successful transaction creation/update/deletion
  const handleTransactionSuccess = (message) => {
    fetchData();
    showNotification(message || t("Transaction saved successfully"));
  };

  // Group transactions by month (for year view)
  const groupTransactionsByMonth = (transactions) => {
    const grouped = {};
    const summaries = {};

    // Initialize months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(
        currentDate.getFullYear(),
        i,
        1
      ).toLocaleString(localStorage.getItem("language") || "en", {
        month: "long",
      });

      grouped[i] = [];
      summaries[i] = { income: 0, expense: 0, balance: 0 };
    }

    // Group transactions by month
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth();

      grouped[month].push(transaction);

      // Update monthly summary
      if (transaction.type === "income") {
        summaries[month].income += transaction.amount;
      } else {
        summaries[month].expense += transaction.amount;
      }
    });

    // Calculate balance for each month
    Object.keys(summaries).forEach((month) => {
      summaries[month].balance =
        summaries[month].income - summaries[month].expense;
    });

    return { monthlyTransactions: grouped, monthlySummaries: summaries };
  };

  // Format month name
  const getMonthName = (monthIndex) => {
    return new Date(currentDate.getFullYear(), monthIndex, 1).toLocaleString(
      localStorage.getItem("language") || "en",
      { month: "long" }
    );
  };

  // Fetch transactions and summary data
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

      // Fetch transactions and summary in parallel
      const [transactionsResponse, summaryResponse] = await Promise.all([
        getTransactions(dateFilter),
        getTransactionSummary(dateFilter),
      ]);

      const fetchedTransactions = transactionsResponse.data;
      setTransactions(fetchedTransactions);
      setSummary(summaryResponse.data);

      // Group transactions by month for year view
      if (viewType === "year") {
        const { monthlyTransactions, monthlySummaries } =
          groupTransactionsByMonth(fetchedTransactions);
        setMonthlyTransactions(monthlyTransactions);
        setMonthlySummaries(monthlySummaries);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showNotification(t("Failed to load data. Please try again."), "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when view type or current date changes
  useEffect(() => {
    fetchData();
  }, [viewType, currentDate]);

  // Check if current date is today
  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Render transactions based on view type
  const renderTransactions = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      );
    }

    if (viewType === "year") {
      return renderYearView();
    }

    return (
      <TransactionList
        transactions={transactions}
        onUpdate={() => fetchData()}
        onAddTransaction={handleOpenAddModal}
      />
    );
  };

  // Render year view with month-wise transactions
  const renderYearView = () => {
    // Get months with transactions
    const monthsWithTransactions = Object.keys(monthlyTransactions)
      .filter((month) => monthlyTransactions[month].length > 0)
      .sort((a, b) => b - a); // Sort in descending order (most recent first)

    if (monthsWithTransactions.length === 0) {
      return (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              mb: 2,
            }}
          >
            <ReceiptLongRoundedIcon
              sx={{
                fontSize: 28,
                color:
                  theme.palette.mode === "light"
                    ? "rgba(0,0,0,0.54)"
                    : "rgba(255,255,255,0.7)",
              }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "1rem",
              color: "text.primary",
              mb: 1,
            }}
          >
            {t("No transactions yet")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              maxWidth: 260,
              mx: "auto",
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            }}
          >
            {t("Add your first transaction to start tracking your finances")}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenAddModal}
            disableElevation
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px", // Google Pay's pill-shaped buttons
              px: 3,
              boxShadow: "none",
              "&:hover": {
                boxShadow:
                  "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
              },
            }}
          >
            {t("Add Transaction")}
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        {monthsWithTransactions.map((month) => {
          const monthSummary = monthlySummaries[month];
          const monthName = getMonthName(parseInt(month));

          return (
            <Accordion
              key={month}
              expanded={expandedMonth === month}
              onChange={handleAccordionChange(month)}
              sx={{
                mb: 2,
                borderRadius: 3,
                "&:before": { display: "none" }, // Remove the default divider
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
              elevation={0}
            >
              <AccordionSummary
                expandIcon={
                  <Box
                    sx={{
                      backgroundColor: alpha(theme.palette.action.active, 0.04),
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0.5,
                      width: 32,
                      height: 32,
                    }}
                  >
                    <ExpandMoreRoundedIcon
                      sx={{
                        fontSize: "1.25rem",
                        color: theme.palette.text.secondary,
                      }}
                    />
                  </Box>
                }
                aria-controls={`month-${month}-content`}
                id={`month-${month}-header`}
                sx={{
                  backgroundColor: "background.paper",
                  borderBottom: expandedMonth === month ? "1px solid" : "none",
                  borderBottomColor: "divider",
                  minHeight: 64,
                  px: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                    mr: 3,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: '"Google Sans", "Roboto", sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {monthName}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily:
                            '"Google Sans Text", "Roboto", sans-serif',
                          fontSize: "0.75rem",
                        }}
                      >
                        {t("Income")}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="success.main"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {formatCurrency(monthSummary.income)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily:
                            '"Google Sans Text", "Roboto", sans-serif',
                          fontSize: "0.75rem",
                        }}
                      >
                        {t("Expense")}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="error.main"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {formatCurrency(monthSummary.expense)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", minWidth: 100 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily:
                            '"Google Sans Text", "Roboto", sans-serif',
                          fontSize: "0.75rem",
                        }}
                      >
                        {t("Balance")}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          fontWeight: 500,
                          color:
                            monthSummary.balance >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {formatCurrency(monthSummary.balance)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TransactionList
                  transactions={monthlyTransactions[month]}
                  onUpdate={() => fetchData()}
                  noBorder
                />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
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
            {t("Home")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            }}
          >
            {t("Welcome back")}, {currentUser?.name}
          </Typography>
        </Box>
        <LanguageSelector />
      </Box>

      {/* View Type Tabs - Google Pay style */}
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
          aria-label="dashboard view tabs"
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
          <Tab value="day" label={t("Day")} />
          <Tab value="month" label={t("Month")} />
          <Tab value="year" label={t("Year")} />
        </Tabs>
      </Paper>

      {/* Date Navigator - Google Pay style */}
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

      {/* Today Button (only show if not on today) - Google Pay style */}
      {!isToday() && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Button
            size="medium"
            startIcon={<TodayRoundedIcon />}
            onClick={handleToday}
            variant="outlined"
            sx={{
              borderRadius: 20,
              px: 3,
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
            }}
          >
            {t("Today")}
          </Button>
        </Box>
      )}

      {/* Summary Card */}
      <SummaryCard summary={summary} loading={loading} />

      {/* Transactions List */}
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "1.125rem",
            }}
          >
            {t("Transactions")}
          </Typography>

          <DownloadMenu />
        </Box>

        {renderTransactions()}
      </Box>

      {/* Add Transaction FAB - Google Pay style */}
      <Fab
        color="primary"
        aria-label="add transaction"
        sx={{
          position: "fixed",
          bottom: 76,
          right: 16,
          width: 56,
          height: 56,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          "&:hover": {
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          },
        }}
        onClick={handleOpenAddModal}
      >
        <AddRoundedIcon />
      </Fab>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={() => {
          handleTransactionSuccess(t("Transaction added successfully"));
          handleCloseAddModal();
        }}
      />

      {/* Date Picker Dialog */}
      <DatePickerDialog
        open={datePickerOpen}
        onClose={handleCloseDatePicker}
        selectedDate={currentDate}
        onDateChange={handleDateChange}
        viewType={viewType}
      />

      {/* Notification Snackbar - Google Pay style */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 8 }} // Add margin to avoid bottom nav
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            borderRadius: 2,
            "& .MuiAlert-message": {
              fontFamily: '"Google Sans", "Roboto", sans-serif',
            },
          }}
          iconMapping={{
            success: <CheckCircleRoundedIcon fontSize="inherit" />,
            error: <ErrorOutlineRoundedIcon fontSize="inherit" />,
            warning: <ErrorOutlineRoundedIcon fontSize="inherit" />,
            info: <InfoRoundedIcon fontSize="inherit" />,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
