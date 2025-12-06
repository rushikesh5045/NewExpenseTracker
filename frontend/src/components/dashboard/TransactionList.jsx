// src/components/dashboard/TransactionList.jsx
import React from "react";
import {
  List,
  Typography,
  Box,
  Paper,
  useTheme,
  Divider,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import TransactionItem from "./TransactionItem";

// Google Pay style icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

const TransactionList = ({
  transactions,
  onUpdate,
  noBorder = false,
  onAddTransaction,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Empty state component with Google Pay styling
  const EmptyState = () => (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: "center",
        bgcolor:
          theme.palette.mode === "light"
            ? "background.paper"
            : "background.paper",
        borderRadius: noBorder ? 3 : 3,
        border: noBorder ? "none" : "1px dashed",
        borderColor: theme.palette.divider,
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

      {onAddTransaction && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon />}
          onClick={onAddTransaction}
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
      )}
    </Box>
  );

  // If no transactions, show empty state
  if (!transactions || transactions.length === 0) {
    return <EmptyState />;
  }

  // Group transactions by date
  const groupTransactionsByDate = () => {
    const grouped = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const dateStr = new Intl.DateTimeFormat(
        localStorage.getItem("language") || "en",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ).format(date);

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push(transaction);
    });

    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();

  // Content component with Google Pay styling
  const TransactionContent = () => (
    <List
      sx={{
        p: 0,
        ".MuiListItem-root:first-of-type": {
          pt: 1.5,
        },
      }}
    >
      {Object.entries(groupedTransactions).map(
        ([date, dateTransactions], groupIndex) => (
          <React.Fragment key={date}>
            {/* Date header - Google Pay style */}
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1.5,
                position: "sticky",
                top: 0,
                zIndex: 1,
                bgcolor:
                  theme.palette.mode === "light"
                    ? "rgba(255,255,255,0.98)"
                    : "rgba(48,49,52,0.98)",
                backdropFilter: "blur(8px)",
                borderBottom:
                  groupIndex === 0
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: theme.palette.text.secondary,
                }}
              >
                {date}
              </Typography>
            </Box>

            {/* Transactions for this date */}
            {dateTransactions.map((transaction, index) => (
              <TransactionItem
                key={transaction._id}
                transaction={transaction}
                isLast={
                  index === dateTransactions.length - 1 &&
                  groupIndex === Object.keys(groupedTransactions).length - 1
                }
                onUpdate={onUpdate}
              />
            ))}

            {/* Add a divider between date groups except after the last group */}
            {groupIndex < Object.keys(groupedTransactions).length - 1 && (
              <Divider
                sx={{
                  my: 1.5,
                  borderColor:
                    theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.08)"
                      : "rgba(255, 255, 255, 0.08)",
                }}
              />
            )}
          </React.Fragment>
        )
      )}
    </List>
  );

  // If noBorder is true, render just the List without the Paper wrapper
  if (noBorder) {
    return <TransactionContent />;
  }

  // Default rendering with Paper wrapper
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3, // More rounded corners for Google Pay style
        overflow: "hidden",
        border: "1px solid",
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <TransactionContent />
    </Paper>
  );
};

export default TransactionList;
