// src/pages/Dashboard.jsx (update)
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
} from "@mui/material";
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  Today as TodayIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/dashboard/SummaryCard";
import TransactionList from "../components/dashboard/TransactionList";
import DownloadMenu from "../components/dashboard/DownloadMenu";
import LanguageSelector from "../components/common/LanguageSelector";
import AddTransactionModal from "../components/transactions/AddTransactionModal";
import DatePickerDialog from "../components/dashboard/DatePickerDialog";
import { getTransactions, getTransactionSummary } from "../services/api";

const Dashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const theme = useTheme();

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
          <CircularProgress />
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
            borderRadius: theme.shape.borderRadius,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t("No transactions found")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("Add a new transaction to get started")}
          </Typography>
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
                borderRadius: theme.shape.borderRadius,
                "&:before": { display: "none" }, // Remove the default divider
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={
                  <Box
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.04)", // Subtle background
                      borderRadius: "50%", // Circular background
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0.5, // Add some padding around the icon
                    }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        fontWeight: "bold", // Make the icon bold
                        stroke: "currentColor",
                        strokeWidth: 0.5, // This helps make the icon appear bolder
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
                  <Typography variant="subtitle1" fontWeight="medium">
                    {monthName}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("Income")}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="success.main"
                        fontWeight="medium"
                      >
                        ₹{monthSummary.income.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("Expense")}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="error.main"
                        fontWeight="medium"
                      >
                        ₹{monthSummary.expense.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", minWidth: 100 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("Balance")}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color={
                          monthSummary.balance >= 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        ₹{monthSummary.balance.toLocaleString()}
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
    <Container maxWidth="sm" sx={{ pb: 7 }}>
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
            {t("Dashboard")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("Welcome back")}, {currentUser?.name}
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
          aria-label="dashboard view tabs"
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
          <Typography variant="h6" component="h2">
            {t("Transactions")}
          </Typography>

          <DownloadMenu />
        </Box>

        {renderTransactions()}
      </Box>

      {/* Add Transaction FAB */}
      <Fab
        color="primary"
        aria-label="add transaction"
        sx={{
          position: "fixed",
          bottom: 76,
          right: 16,
        }}
        onClick={handleOpenAddModal}
      >
        <AddIcon />
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

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
