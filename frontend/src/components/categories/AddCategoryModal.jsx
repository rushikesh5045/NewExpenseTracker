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


import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";

const categoryColors = [
  "#1a73e8",
  "#d93025",
  "#1e8e3e",
  "#f9ab00",
  "#9334e6",
  "#fa903e",
  "#1bb8c4",
  "#d01884",
  "#5f6368",
  "#188038",
  "#c5221f",
  "#24c1e0",
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
      newErrors.name = t("category_name_is_required");
    }

    if (!formData.color) {
      newErrors.color = t("please_select_a_color");
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
          submit: t("failed_to_create_category_please_try_again"),
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
          borderRadius: 3,
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
          {t("add_category")}
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
        {/* Category Type Toggle toggle */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={formData.type}
            exclusive
            onChange={handleTypeChange}
            aria-label="category type"
            fullWidth
            sx={{
              "& .MuiToggleButtonGroup-grouped": {
                borderRadius: "20px !important",
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
              {t("income")}
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
              {t("expense")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Category Name text field */}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          name="name"
          label={t("category_name")}
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

        {/* Color Selection color picker */}
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
            {t("select_color")}
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
            borderRadius: 20,
            px: 3,
            color:
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.6)"
                : "rgba(255,255,255,0.7)",
          }}
        >
          {t("cancel")}
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
            borderRadius: 20,
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
          {isSubmitting ? t("creating") : t("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryModal;
