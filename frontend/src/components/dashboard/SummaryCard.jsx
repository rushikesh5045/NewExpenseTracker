import React from "react";
import {
  Paper,
  Box,
  Typography,
  Divider,
  Skeleton,
  useTheme,
} from "@mui/material";
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const SummaryCard = ({ summary, loading }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(localStorage.getItem("language") || "en", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Balance */}
      <Box sx={{ textAlign: "center", p: 3, pb: 2 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t("Current Balance")}
        </Typography>

        {loading ? (
          <Skeleton
            variant="text"
            width="60%"
            height={48}
            sx={{ mx: "auto" }}
          />
        ) : (
          <Typography
            variant="h4"
            component="p"
            fontWeight="medium"
            color={summary.balance >= 0 ? "success.main" : "error.main"}
            sx={{ mt: 1 }}
          >
            ₹{summary.balance.toLocaleString()}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Income and Expense */}
      <Box sx={{ display: "flex" }}>
        {/* Income */}
        <Box
          sx={{
            flex: 1,
            textAlign: "center",
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <IncomeIcon
              fontSize="small"
              sx={{
                color: "success.main",
                mr: 0.5,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {t("Income")}
            </Typography>
          </Box>

          {loading ? (
            <Skeleton variant="text" width={80} height={32} />
          ) : (
            <Typography
              variant="h6"
              component="p"
              fontWeight="medium"
              color="success.main"
            >
              ₹{summary.income.toLocaleString()}
            </Typography>
          )}
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Expense */}
        <Box
          sx={{
            flex: 1,
            textAlign: "center",
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <ExpenseIcon
              fontSize="small"
              sx={{
                color: "error.main",
                mr: 0.5,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {t("Expense")}
            </Typography>
          </Box>

          {loading ? (
            <Skeleton variant="text" width={80} height={32} />
          ) : (
            <Typography
              variant="h6"
              component="p"
              fontWeight="medium"
              color="error.main"
            >
              ₹{summary.expense.toLocaleString()}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default SummaryCard;
