import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Avatar,
  Divider,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  AddCircleOutline as AddCategoryIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";
import {
  createTransaction,
  updateTransaction,
  getCategories,
} from "../../services/api";
import AddCategoryModal from "../categories/AddCategoryModal";

const AddTransactionModal = ({
  open,
  onClose,
  onSuccess,
  isEditing = false,
  transaction = null,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: new Date(),
    notes: "",
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Categories state
  const [categories, setCategories] = useState([]);

  // Add Category modal state
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (isEditing && transaction) {
        setFormData({
          amount: transaction.amount.toString(),
          type: transaction.type,
          category: transaction.category._id,
          date: new Date(transaction.date),
          notes: transaction.notes || "",
        });
      } else {
        setFormData({
          amount: "",
          type: "expense",
          category: "",
          date: new Date(),
          notes: "",
        });
      }
    }
  }, [open, isEditing, transaction]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!open) return;

      try {
        setLoadingCategories(true);
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open, addCategoryModalOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle type change
  const handleTypeChange = (e, newType) => {
    if (newType !== null) {
      // Clear category when type changes
      setFormData({
        ...formData,
        type: newType,
        category: "",
      });
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate,
    });
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const value = e.target.value;

    // If the value is "add_new", open the add category modal
    if (value === "add_new") {
      handleOpenAddCategoryModal();
      return;
    }

    setFormData({
      ...formData,
      category: value,
    });
  };

  // Open add category modal
  const handleOpenAddCategoryModal = () => {
    setAddCategoryModalOpen(true);
  };

  // Close add category modal
  const handleCloseAddCategoryModal = () => {
    setAddCategoryModalOpen(false);
  };

  // Get category initials for avatar
  const getCategoryInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  // Get avatar colors based on category
  const getAvatarColors = (category) => {
    if (!category) return { bgColor: "#f1f3f4", textColor: "#5f6368" };

    const type = category.type;
    const categoryName = category.name.toLowerCase();

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

  // Filter categories by type
  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount) {
      newErrors.amount = t("Amount is required");
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t("Amount must be a positive number");
    }

    if (!formData.category) {
      newErrors.category = t("Category is required");
    }

    if (!formData.date) {
      newErrors.date = t("Date is required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Format data for API
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (isEditing && transaction) {
        // Update existing transaction
        await updateTransaction(transaction._id, transactionData);
      } else {
        // Create new transaction
        await createTransaction(transactionData);
      }

      // Call success callback and close modal
      onSuccess();
      onClose();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} transaction:`,
        error
      );
      // Handle API errors
      if (error.response?.data?.message) {
        setErrors({
          submit: error.response.data.message,
        });
      } else {
        setErrors({
          submit: t(
            `Failed to ${
              isEditing ? "update" : "create"
            } transaction. Please try again.`
          ),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render category items for the select dropdown
  // Render category items for the select dropdown
  const renderCategoryItems = () => {
    if (loadingCategories) {
      return [
        <MenuItem key="loading" value="" disabled>
          <Box sx={{ display: "flex", alignItems: "center", py: 1 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            {t("Loading categories...")}
          </Box>
        </MenuItem>,
      ];
    }

    if (filteredCategories.length === 0) {
      return [
        <MenuItem key="no-categories" value="" disabled>
          {t("No categories available")}
        </MenuItem>,
      ];
    }

    // Return an array of MenuItems instead of a Fragment
    const categoryItems = filteredCategories.map((category) => {
      const { bgColor, textColor } = getAvatarColors(category);
      return (
        <MenuItem key={category._id} value={category._id}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 2,
                bgcolor: bgColor,
                color: textColor,
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {getCategoryInitials(category.name)}
            </Avatar>
            <ListItemText primary={category.name} />
          </Box>
        </MenuItem>
      );
    });

    // Add the "Add New Category" option
    categoryItems.push(
      <Divider key="divider" sx={{ my: 1 }} />,
      <MenuItem
        key="add-new"
        value="add_new"
        sx={{ color: "primary.main", fontWeight: 500 }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AddCategoryIcon sx={{ mr: 2 }} />
          {t("Add New Category")}
        </Box>
      </MenuItem>
    );

    return categoryItems;
  };

  // src/components/transactions/AddTransactionModal.jsx
  // Add this function definition

  // Handle category creation success
  const handleCategorySuccess = () => {
    // Refresh categories list after adding a new category
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
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
          <Typography variant="h6">
            {isEditing ? t("Edit Transaction") : t("Add Transaction")}
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

        <DialogContent dividers>
          {/* Transaction Type Toggle */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={handleTypeChange}
              aria-label="transaction type"
              color="primary"
              sx={{ width: "100%" }}
              disabled={isEditing} // Disable type change when editing
            >
              <ToggleButton
                value="income"
                aria-label="income"
                sx={{
                  flex: 1,
                  py: 1,
                  color: "success.main",
                  "&.Mui-selected": {
                    color: "white",
                    backgroundColor: "success.main",
                  },
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                {t("Income")}
              </ToggleButton>
              <ToggleButton
                value="expense"
                aria-label="expense"
                sx={{
                  flex: 1,
                  py: 1,
                  color: "error.main",
                  "&.Mui-selected": {
                    color: "white",
                    backgroundColor: "error.main",
                  },
                }}
              >
                <RemoveIcon sx={{ mr: 1 }} />
                {t("Expense")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Amount Field */}
          <TextField
            autoFocus={!isEditing}
            margin="dense"
            id="amount"
            name="amount"
            label={t("Amount")}
            type="number"
            fullWidth
            variant="outlined"
            value={formData.amount}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {/* Category Selection */}
          <FormControl
            fullWidth
            variant="outlined"
            error={!!errors.category}
            sx={{ mb: 3 }}
          >
            <InputLabel id="category-label">{t("Category")}</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              label={t("Category")}
              disabled={loadingCategories}
            >
              {renderCategoryItems()}
            </Select>
            {errors.category && (
              <FormHelperText>{errors.category}</FormHelperText>
            )}
          </FormControl>

          {/* Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t("Date")}
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="dense"
                  error={!!errors.date}
                  helperText={errors.date}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
              )}
            />
          </LocalizationProvider>

          {/* Notes Field */}
          <TextField
            margin="dense"
            id="notes"
            name="notes"
            label={t("Notes (Optional)")}
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange}
          />

          {/* Submit Error */}
          {errors.submit && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.submit}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? t("Saving...")
              : isEditing
              ? t("Update")
              : t("Save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Modal */}
      <AddCategoryModal
        open={addCategoryModalOpen}
        onClose={handleCloseAddCategoryModal}
        onSuccess={handleCategorySuccess}
        initialType={formData.type}
      />
    </>
  );
};

export default AddTransactionModal;
