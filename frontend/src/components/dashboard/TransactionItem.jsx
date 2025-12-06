import React, { useState } from "react";
import {
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import TransactionDetailModal from "./TransactionDetailModal";

// Optional: Import icons for specific categories
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";

const TransactionItem = ({ transaction, isLast, onUpdate }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [detailOpen, setDetailOpen] = useState(false);

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(localStorage.getItem("language") || "en", {
      day: "numeric",
      month: "short",
    }).format(new Date(date));
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

  const handleOpenDetail = () => {
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
  };

  // Get first two letters of category name for avatar
  const getCategoryInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  // Get category icon based on category name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (
      name.includes("food") ||
      name.includes("restaurant") ||
      name.includes("dining")
    ) {
      return <RestaurantRoundedIcon fontSize="small" />;
    } else if (
      name.includes("transport") ||
      name.includes("travel") ||
      name.includes("bus") ||
      name.includes("train")
    ) {
      return <DirectionsBusRoundedIcon fontSize="small" />;
    } else if (
      name.includes("salary") ||
      name.includes("income") ||
      name.includes("work")
    ) {
      return <WorkRoundedIcon fontSize="small" />;
    } else if (name.includes("shopping") || name.includes("purchase")) {
      return <ShoppingBagRoundedIcon fontSize="small" />;
    }

    // Default: return null and use initials instead
    return null;
  };

  // Google Pay style avatar colors
  const getAvatarColors = () => {
    const type = transaction.type;

    // Google Pay style color mapping
    if (type === "income") {
      return {
        bgColor: "rgba(30, 142, 62, 0.12)",
        textColor: "#1e8e3e", // Google Green
      };
    } else {
      return {
        bgColor: "rgba(217, 48, 37, 0.12)",
        textColor: "#d93025", // Google Red
      };
    }
  };

  const { bgColor, textColor } = getAvatarColors();
  const categoryIcon = getCategoryIcon(transaction.category.name);

  return (
    <>
      <ListItem
        button
        onClick={handleOpenDetail}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(255, 255, 255, 0.04)",
          },
          borderRadius: 1,
          mx: 0.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: bgColor,
            color: textColor,
            mr: 2,
            width: 40,
            height: 40,
            fontWeight: 500,
            fontSize: "0.875rem",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
          }}
        >
          {categoryIcon || getCategoryInitials(transaction.category.name)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "0.9375rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {transaction.category.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              fontSize: "0.8125rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {transaction.notes || t("No description")}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right", ml: 2, flexShrink: 0 }}>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "0.9375rem",
              color: transaction.type === "income" ? "#1e8e3e" : "#d93025",
            }}
          >
            {transaction.type === "income" ? "+" : "-"}{" "}
            {formatCurrency(transaction.amount)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              fontSize: "0.75rem",
            }}
          >
            {formatDate(transaction.date)}
          </Typography>
        </Box>
      </ListItem>

      {!isLast && (
        <Divider
          sx={{
            mx: { xs: 2, sm: 3 },
            borderColor:
              theme.palette.mode === "light"
                ? "rgba(0, 0, 0, 0.08)"
                : "rgba(255, 255, 255, 0.08)",
          }}
        />
      )}

      <TransactionDetailModal
        open={detailOpen}
        onClose={handleCloseDetail}
        transaction={transaction}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default TransactionItem;
