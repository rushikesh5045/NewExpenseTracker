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
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { deleteTransaction } from "../../services/api";
import AddTransactionModal from "../transactions/AddTransactionModal";

const TransactionDetailModal = ({ open, onClose, transaction, onUpdate }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!transaction) return null;

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(localStorage.getItem("language") || "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(t("Are you sure you want to delete this transaction?"))
    ) {
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
      }
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
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            width: fullScreen ? "100%" : "100%",
            maxWidth: "500px",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" component="div">
            {t("Transaction Details")}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          {/* Amount */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h4"
              component="div"
              fontWeight="medium"
              color={
                transaction.type === "income" ? "success.main" : "error.main"
              }
            >
              {transaction.type === "income" ? "+" : "-"} ₹{transaction.amount}
            </Typography>
          </Box>

          {/* Category */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: bgColor,
                color: textColor,
                width: 56,
                height: 56,
                mr: 2,
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              {getCategoryInitials(transaction.category.name)}
            </Avatar>

            <Box>
              <Typography variant="body2" color="text.secondary">
                {t("Category")}
              </Typography>
              <Typography variant="h6" component="div">
                {transaction.category.name}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Date */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CalendarIcon color="action" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t("Date")}
              </Typography>
              <Typography variant="body1">
                {formatDate(transaction.date)}
              </Typography>
            </Box>
          </Box>

          {/* Notes */}
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <NotesIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t("Notes")}
              </Typography>
              <Typography variant="body1">
                {transaction.notes || t("No notes added")}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button
            onClick={handleDelete}
            color="error"
            startIcon={
              isDeleting ? (
                <CircularProgress size={20} color="error" />
              ) : (
                <DeleteIcon />
              )
            }
            disabled={isDeleting}
          >
            {isDeleting ? t("Deleting...") : t("Delete")}
          </Button>
          <Button
            onClick={handleOpenEditModal}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
          >
            {t("Edit")}
          </Button>
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
