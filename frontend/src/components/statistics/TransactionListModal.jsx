// src/components/statistics/TransactionListModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Chip,
  Slide,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import TransactionDetailModal from "../dashboard/TransactionDetailModal";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TransactionListModal = ({
  open,
  onClose,
  title,
  transactions = [],
  onUpdate,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(localStorage.getItem("language") || "en", {
      day: "numeric",
      month: "short",
      year: "numeric",
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

  // Get category initials
  const getCategoryInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  // Calculate total
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const incomeAmount = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseAmount = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleUpdate = () => {
    onUpdate && onUpdate();
    handleCloseDetail();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            pt: 2,
            px: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                fontSize: "1.125rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                mt: 0.5,
              }}
            >
              {transactions.length} {t("transactions")}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        {/* Summary chips */}
        <Box sx={{ px: 3, pb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {incomeAmount > 0 && (
            <Chip
              icon={<TrendingUpRoundedIcon />}
              label={formatCurrency(incomeAmount)}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                "& .MuiChip-icon": {
                  color: theme.palette.success.main,
                },
              }}
            />
          )}
          {expenseAmount > 0 && (
            <Chip
              icon={<TrendingDownRoundedIcon />}
              label={formatCurrency(expenseAmount)}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                "& .MuiChip-icon": {
                  color: theme.palette.error.main,
                },
              }}
            />
          )}
        </Box>

        <Divider />

        <DialogContent sx={{ p: 0 }}>
          {transactions.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                }}
              >
                {t("no_transactions_found")}
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {transactions.map((transaction, index) => {
                const categoryColor =
                  transaction.category?.color || theme.palette.primary.main;
                const isIncome = transaction.type === "income";

                return (
                  <React.Fragment key={transaction._id}>
                    <ListItem
                      button
                      onClick={() => handleTransactionClick(transaction)}
                      sx={{
                        py: 2,
                        px: 3,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.action.hover,
                            0.04
                          ),
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 52 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: alpha(categoryColor, 0.15),
                            color: categoryColor,
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            fontFamily: '"Google Sans", "Roboto", sans-serif',
                          }}
                        >
                          {getCategoryInitials(
                            transaction.category?.name || ""
                          )}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontFamily: '"Google Sans", "Roboto", sans-serif',
                              fontWeight: 500,
                              fontSize: "0.9375rem",
                            }}
                          >
                            {transaction.category?.name || t("category")}
                          </Typography>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontFamily:
                                  '"Google Sans Text", "Roboto", sans-serif',
                                fontSize: "0.8125rem",
                              }}
                            >
                              {formatDate(transaction.date)}
                            </Typography>
                            {transaction.notes && (
                              <>
                                <Box
                                  component="span"
                                  sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    backgroundColor:
                                      theme.palette.text.disabled,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontFamily:
                                      '"Google Sans Text", "Roboto", sans-serif',
                                    fontSize: "0.8125rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 120,
                                  }}
                                >
                                  {transaction.notes}
                                </Typography>
                              </>
                            )}
                          </Box>
                        }
                      />
                      <Typography
                        sx={{
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          fontWeight: 500,
                          fontSize: "0.9375rem",
                          color: isIncome
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        }}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </ListItem>
                    {index < transactions.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetail}
        transaction={selectedTransaction}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default TransactionListModal;
