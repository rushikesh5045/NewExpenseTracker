// src/components/categories/AddCategoryModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { createCategory } from "../../services/api";

// Predefined colors for category selection
const categoryColors = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#F44336", // Red
  "#FF9800", // Orange
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
  "#00BCD4", // Cyan
  "#FFEB3B", // Yellow
  "#9E9E9E", // Grey
  "#3F51B5", // Indigo
];

const AddCategoryModal = ({
  open,
  onClose,
  onSuccess,
  initialType = "expense",
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: initialType,
    color: categoryColors[0],
    icon: "category", // Default icon
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setFormData({
        ...formData,
        type: newType,
      });
    }
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setFormData({
      ...formData,
      color,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("Category name is required");
    }

    if (!formData.color) {
      newErrors.color = t("Please select a color");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await createCategory(formData);

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);

      // Handle API errors
      if (error.response?.data?.message) {
        setErrors({
          submit: error.response.data.message,
        });
      } else {
        setErrors({
          submit: t("Failed to create category. Please try again."),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
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
        <Typography variant="h6">{t("Add Category")}</Typography>
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
        {/* Category Type Toggle */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={formData.type}
            exclusive
            onChange={handleTypeChange}
            aria-label="category type"
            color="primary"
            sx={{ width: "100%" }}
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

        {/* Category Name */}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          name="name"
          label={t("Category Name")}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mb: 3 }}
        />

        {/* Color Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <PaletteIcon fontSize="small" sx={{ mr: 1 }} />
            {t("Select Color")}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {categoryColors.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    formData.color === color
                      ? "2px solid black"
                      : "2px solid transparent",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </Box>

          {errors.color && (
            <FormHelperText error>{errors.color}</FormHelperText>
          )}
        </Box>

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
          {isSubmitting ? t("Creating...") : t("Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryModal;
