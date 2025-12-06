import React from "react";
import {
  Paper,
  Box,
  Typography,
  Divider,
  Skeleton,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Use rounded Material Icons for Google Pay style
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

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
        borderRadius: 3, // Google Pay uses more rounded corners
        overflow: "hidden",
        bgcolor: theme.palette.mode === "light" ? "#ffffff" : "#303134",
        border: "1px solid",
        borderColor: theme.palette.divider,
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      {/* Balance - Google Pay style */}
      <Box
        sx={{
          p: 3,
          pb: 2.5,
          backgroundColor: theme.palette.primary.main, // Google Pay blue background
          color: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}
        >
          <AccountBalanceWalletRoundedIcon
            fontSize="small"
            sx={{ mr: 1, opacity: 0.9 }}
          />
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
            }}
          >
            {t("Current Balance")}
          </Typography>
        </Box>

        {loading ? (
          <Skeleton
            variant="text"
            width="60%"
            height={48}
            sx={{
              mx: "auto",
              bgcolor: "rgba(255,255,255,0.2)",
            }}
          />
        ) : (
          <Typography
            variant="h4"
            component="p"
            sx={{
              textAlign: "center",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 400,
              fontSize: "2rem",
            }}
          >
            {formatCurrency(summary.balance)}
          </Typography>
        )}
      </Box>

      {/* Income and Expense - Google Pay style */}
      <Box sx={{ display: "flex" }}>
        {/* Income */}
        <Box
          sx={{
            flex: 1,
            p: 2.5,
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
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(30, 142, 62, 0.08)" // Light green background
                    : "rgba(30, 142, 62, 0.16)", // Darker green background for dark mode
                mb: 1,
              }}
            >
              <TrendingUpRoundedIcon
                fontSize="small"
                sx={{
                  color: theme.palette.success.main,
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              mb: 0.5,
            }}
          >
            {t("Income")}
          </Typography>

          {loading ? (
            <Skeleton variant="text" width={80} height={32} />
          ) : (
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: theme.palette.success.main,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
              }}
            >
              {formatCurrency(summary.income)}
            </Typography>
          )}
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Expense */}
        <Box
          sx={{
            flex: 1,
            p: 2.5,
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
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(217, 48, 37, 0.08)" // Light red background
                    : "rgba(217, 48, 37, 0.16)", // Darker red background for dark mode
                mb: 1,
              }}
            >
              <TrendingDownRoundedIcon
                fontSize="small"
                sx={{
                  color: theme.palette.error.main,
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              mb: 0.5,
            }}
          >
            {t("Expense")}
          </Typography>

          {loading ? (
            <Skeleton variant="text" width={80} height={32} />
          ) : (
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: theme.palette.error.main,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
              }}
            >
              {formatCurrency(summary.expense)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default SummaryCard;
