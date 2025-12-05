// src/components/dashboard/TransactionList.jsx
import React from "react";
import { List, Typography, Box, Paper, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import TransactionItem from "./TransactionItem";

const TransactionList = ({ transactions, onUpdate, noBorder = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!transactions || transactions.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: noBorder ? 4 : theme.shape.borderRadius,
          border: noBorder ? "none" : "1px dashed",
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

  // If noBorder is true, render just the List without the Paper wrapper
  if (noBorder) {
    return (
      <List sx={{ p: 0 }}>
        {transactions.map((transaction, index) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            isLast={index === transactions.length - 1}
            onUpdate={onUpdate}
          />
        ))}
      </List>
    );
  }

  // Default rendering with Paper wrapper
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <List sx={{ p: 0 }}>
        {transactions.map((transaction, index) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            isLast={index === transactions.length - 1}
            onUpdate={onUpdate}
          />
        ))}
      </List>
    </Paper>
  );
};

export default TransactionList;
