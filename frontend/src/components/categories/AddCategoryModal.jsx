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
  FormHelperText,
  useTheme,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { createCategory } from "../../services/api";

// Replace with Material Symbols for Google Pay look
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";

// Google Pay color palette
const categoryColors = [
  "#1a73e8", // Google Blue
  "#d93025", // Google Red
  "#1e8e3e", // Google Green
  "#f9ab00", // Google Yellow
  "#9334e6", // Purple
  "#fa903e", // Orange
  "#1bb8c4", // Teal
  "#d01884", // Pink
  "#5f6368", // Gray
  "#188038", // Dark Green
  "#c5221f", // Dark Red
  "#24c1e0", // Light Blue
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
        elevation: 0,
        sx: {
          borderRadius: 3, // Google Pay uses more rounded corners
          overflow: "hidden",
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
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "1.125rem",
          }}
        >
          {t("Add Category")}
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
          px: 3,
          py: 2,
          "&.MuiDialogContent-dividers": {
            borderTop: "none",
            borderBottom: "none",
          },
        }}
      >
        {/* Category Type Toggle - Google Pay style toggle */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={formData.type}
            exclusive
            onChange={handleTypeChange}
            aria-label="category type"
            fullWidth
            sx={{
              "& .MuiToggleButtonGroup-grouped": {
                borderRadius: "20px !important", // Pill shape like Google Pay
                mx: 0,
                border: `1px solid ${theme.palette.divider}`,
                "&.Mui-selected": {
                  boxShadow: "none",
                },
                height: 40,
              },
            }}
          >
            <ToggleButton
              value="income"
              aria-label="income"
              sx={{
                px: 3,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                textTransform: "none",
                fontSize: "0.875rem",
                color: theme.palette.success.main,
                "&.Mui-selected": {
                  color: "#fff",
                  backgroundColor: theme.palette.success.main,
                },
              }}
            >
              <AddRoundedIcon sx={{ mr: 1, fontSize: 20 }} />
              {t("Income")}
            </ToggleButton>
            <ToggleButton
              value="expense"
              aria-label="expense"
              sx={{
                px: 3,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                textTransform: "none",
                fontSize: "0.875rem",
                color: theme.palette.error.main,
                "&.Mui-selected": {
                  color: "#fff",
                  backgroundColor: theme.palette.error.main,
                },
              }}
            >
              <RemoveRoundedIcon sx={{ mr: 1, fontSize: 20 }} />
              {t("Expense")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Category Name - Google Pay style text field */}
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
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
              },
            },
            "& .MuiInputLabel-root": {
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            },
            "& .MuiInputBase-input": {
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            },
          }}
        />

        {/* Color Selection - Google Pay style color picker */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              color: theme.palette.text.primary,
              mb: 1.5,
            }}
          >
            <ColorLensRoundedIcon
              fontSize="small"
              sx={{
                mr: 1,
                color: theme.palette.primary.main,
              }}
            />
            {t("Select Color")}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 1.5,
              mt: 1,
            }}
          >
            {categoryColors.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    formData.color === color
                      ? `2px solid ${
                          theme.palette.mode === "dark" ? "#fff" : "#000"
                        }`
                      : "2px solid transparent",
                  boxShadow:
                    formData.color === color
                      ? `0 0 0 2px ${alpha(color, 0.3)}`
                      : "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />
            ))}
          </Box>

          {errors.color && (
            <FormHelperText
              error
              sx={{
                mt: 1,
                ml: 1.5,
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              }}
            >
              {errors.color}
            </FormHelperText>
          )}
        </Box>

        {/* Submit Error */}
        {errors.submit && (
          <Typography
            color="error"
            variant="body2"
            sx={{
              mt: 2,
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {errors.submit}
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          sx={{
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            borderRadius: 20, // Google Pay's pill-shaped buttons
            px: 3,
            color:
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.6)"
                : "rgba(255,255,255,0.7)",
          }}
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          disableElevation
          sx={{
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            borderRadius: 20, // Google Pay's pill-shaped buttons
            px: 3,
            py: 1,
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
            },
          }}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? t("Creating...") : t("Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryModal;
