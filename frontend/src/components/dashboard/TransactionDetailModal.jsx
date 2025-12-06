import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  Box,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fade,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { deleteTransaction } from "../../services/api";
import AddTransactionModal from "../transactions/AddTransactionModal";

// Use rounded Material Icons for Google Pay style
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

const TransactionDetailModal = ({ open, onClose, transaction, onUpdate }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!transaction) return null;

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(localStorage.getItem("language") || "en", {
      day: "numeric",
      month: "long",
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

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction(transaction._id);
      onUpdate(); // Refresh data after deletion
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert(t("Failed to delete transaction. Please try again."));
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
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

  // Google Pay style avatar colors
  const getAvatarColors = () => {
    const type = transaction.type;

    // Google Pay style color mapping
    if (type === "income") {
      return {
        bgColor: "rgba(30, 142, 62, 0.12)",
        textColor: "#1e8e3e", // Google Green
        lightBg: "rgba(30, 142, 62, 0.05)",
        chipBg: "rgba(30, 142, 62, 0.08)",
      };
    } else {
      return {
        bgColor: "rgba(217, 48, 37, 0.12)",
        textColor: "#d93025", // Google Red
        lightBg: "rgba(217, 48, 37, 0.05)",
        chipBg: "rgba(217, 48, 37, 0.08)",
      };
    }
  };

  const { bgColor, textColor, lightBg, chipBg } = getAvatarColors();

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        TransitionComponent={Fade}
        transitionDuration={250}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: { xs: fullScreen ? 0 : 3, sm: 3 }, // No radius on mobile fullscreen
            width: fullScreen ? "100%" : "100%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)", // Google Pay's shadow style
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "1.125rem",
            }}
          >
            {t("Transaction Details")}
          </Typography>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            sx={{
              color:
                theme.palette.mode === "light"
                  ? "rgba(0,0,0,0.54)"
                  : "rgba(255,255,255,0.7)",
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            py: 3,
            "&.MuiDialogContent-dividers": {
              borderTop: "none",
              borderBottom: "none",
            },
          }}
        >
          {/* Amount - Enhanced Google Pay style */}
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              backgroundColor: lightBg,
              py: 3,
              px: 2,
              borderRadius: 3, // More rounded like Google Pay
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                backgroundColor: textColor,
              },
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
              <Chip
                label={
                  transaction.type === "income" ? t("Income") : t("Expense")
                }
                size="small"
                sx={{
                  backgroundColor: chipBg,
                  color: textColor,
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  height: 24,
                  borderRadius: 12,
                  mb: 1,
                }}
              />
            </Box>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 400,
                color: textColor,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              {transaction.type === "income" ? "+" : "-"}{" "}
              {formatCurrency(transaction.amount)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: "text.secondary",
                display: "block",
                mt: 1,
              }}
            >
              {formatDate(transaction.date)}
            </Typography>
          </Box>

          {/* Category - Enhanced Google Pay style */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              p: 2,
              backgroundColor: "background.subtle",
              borderRadius: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: bgColor,
                color: textColor,
                width: 48,
                height: 48,
                mr: 2,
                fontWeight: 500,
                fontSize: "1rem",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
              }}
            >
              {getCategoryInitials(transaction.category.name)}
            </Avatar>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  fontSize: "0.75rem",
                }}
              >
                {t("Category")}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                }}
              >
                {transaction.category.name}
              </Typography>
            </Box>
          </Box>

          {/* Notes - Enhanced Google Pay style */}
          {transaction.notes && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: "background.subtle",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <NotesRoundedIcon
                  sx={{
                    color: "text.secondary",
                    fontSize: "1rem",
                    mr: 1,
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {t("Notes")}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  pl: 0.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {transaction.notes}
              </Typography>
            </Box>
          )}

          {/* Transaction ID - Google Pay style subtle info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 3,
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: "text.disabled",
                fontSize: "0.75rem",
              }}
            >
              {t("Transaction ID")}: {transaction._id.substring(0, 8)}...
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            justifyContent: confirmDelete ? "center" : "space-between",
            borderTop: `1px solid ${theme.palette.divider}`,
            flexDirection: confirmDelete ? "column" : "row",
            gap: confirmDelete ? 2 : 0,
          }}
        >
          {confirmDelete ? (
            // Confirmation state
            <>
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  textAlign: "center",
                  color: "text.primary",
                }}
              >
                {t("Are you sure you want to delete this transaction?")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <Button
                  onClick={handleCancelDelete}
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  sx={{
                    textTransform: "none",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    borderRadius: "20px",
                  }}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="contained"
                  color="error"
                  fullWidth
                  disabled={isDeleting}
                  startIcon={
                    isDeleting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                  sx={{
                    textTransform: "none",
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    borderRadius: "20px",
                    boxShadow: "none",
                  }}
                >
                  {isDeleting ? t("Deleting...") : t("Delete")}
                </Button>
              </Box>
            </>
          ) : (
            // Normal state
            <>
              <Button
                onClick={handleDeleteClick}
                color="error"
                startIcon={<DeleteRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  borderRadius: "20px", // Google Pay's pill-shaped buttons
                  px: 2,
                }}
              >
                {t("Delete")}
              </Button>
              <Button
                onClick={handleOpenEditModal}
                variant="contained"
                color="primary"
                startIcon={<EditRoundedIcon />}
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
                {t("Edit")}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Modal */}
      {transaction && (
        <AddTransactionModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={() => {
            onUpdate(); // Refresh data after edit
            handleCloseEditModal();
            onClose();
          }}
          isEditing={true}
          transaction={transaction}
        />
      )}
    </>
  );
};

export default TransactionDetailModal;
