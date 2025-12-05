import React, { useState } from "react";
import {
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import TransactionDetailModal from "./TransactionDetailModal";

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

  // Get avatar background and text color based on category
  const getAvatarColors = () => {
    const type = transaction.type;
    const categoryName = transaction.category.name.toLowerCase();

    // Default colors based on transaction type
    let bgColor = type === "income" ? "#e6f4ea" : "#fce8e6";
    let textColor = type === "income" ? "#188038" : "#c5221f";

    // Specific category colors
    if (categoryName.includes("salary")) {
      bgColor = "#e8f0fe";
      textColor = "#1967d2";
    } else if (categoryName.includes("food")) {
      bgColor = "#fef7e0";
      textColor = "#b06000";
    } else if (categoryName.includes("transport")) {
      bgColor = "#e6f4ea";
      textColor = "#188038";
    }

    return { bgColor, textColor };
  };

  const { bgColor, textColor } = getAvatarColors();

  return (
    <>
      <ListItem
        button
        onClick={handleOpenDetail}
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: bgColor,
            color: textColor,
            mr: 2,
            width: 48,
            height: 48,
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {getCategoryInitials(transaction.category.name)}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" component="div" fontWeight="medium">
            {transaction.category.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {transaction.notes || t("No description")}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right", ml: 2 }}>
          <Typography
            variant="subtitle1"
            component="div"
            fontWeight="medium"
            color={
              transaction.type === "income" ? "success.main" : "error.main"
            }
          >
            {transaction.type === "income" ? "+" : "-"} ₹{transaction.amount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(transaction.date)}
          </Typography>
        </Box>
      </ListItem>

      {!isLast && <Divider />}

      <TransactionDetailModal
        open={detailOpen}
        onClose={handleCloseDetail}
        transaction={transaction}
        onUpdate={onUpdate} // Pass the update handler
      />
    </>
  );
};

export default TransactionItem;
