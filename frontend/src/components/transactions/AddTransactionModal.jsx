import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Slide,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Backdrop,
} from "@mui/material";
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

// Google Pay style icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import SubjectRoundedIcon from "@mui/icons-material/SubjectRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

// Slide up transition like Google Pay
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const [selectedCategory, setSelectedCategory] = useState(null);

  // UI states
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
        // Find the selected category object
        if (categories.length > 0) {
          const category = categories.find(
            (c) => c._id === transaction.category._id
          );
          setSelectedCategory(category || null);
        }
      } else {
        setFormData({
          amount: "",
          type: "expense",
          category: "",
          date: new Date(),
          notes: "",
        });
        setSelectedCategory(null);
      }
      setErrors({});
      setShowCategorySelector(false);
      setShowDatePicker(false);
    }
  }, [open, isEditing, transaction, categories]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!open) return;

      try {
        setLoadingCategories(true);
        const response = await getCategories();
        setCategories(response.data);

        // If editing, set the selected category
        if (isEditing && transaction && response.data.length > 0) {
          const category = response.data.find(
            (c) => c._id === transaction.category._id
          );
          setSelectedCategory(category || null);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open, addCategoryModalOpen, isEditing, transaction]);

  // Handle amount change with validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setFormData({
        ...formData,
        amount: value,
      });

      if (errors.amount) {
        setErrors({
          ...errors,
          amount: "",
        });
      }
    }
  };

  // Handle notes change
  const handleNotesChange = (e) => {
    setFormData({
      ...formData,
      notes: e.target.value,
    });
  };

  // Handle type change
  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      category: "", // Clear category when type changes
    });
    setSelectedCategory(null);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate,
    });
    setShowDatePicker(false);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category: category._id,
    });
    setSelectedCategory(category);
    setShowCategorySelector(false);

    if (errors.category) {
      setErrors({
        ...errors,
        category: "",
      });
    }
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

  // Google Pay style avatar colors
  const getAvatarColors = (category) => {
    if (!category)
      return {
        bgColor: alpha(theme.palette.action.active, 0.08),
        textColor: theme.palette.text.secondary,
      };

    const type = category.type;

    // Google Pay style color mapping
    if (type === "income") {
      return {
        bgColor: alpha(theme.palette.success.main, 0.12),
        textColor: theme.palette.success.main,
      };
    } else {
      return {
        bgColor: alpha(theme.palette.error.main, 0.12),
        textColor: theme.palette.error.main,
      };
    }
  };

  // Filter categories by type
  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(localStorage.getItem("language") || "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount) {
      newErrors.amount = t("Amount is required");
    } else if (
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
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

  // Main transaction form
  const renderMainForm = () => (
    <>
      {/* Header with type toggle */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 5,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ color: theme.palette.text.secondary }}
          >
            <CloseRoundedIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "1.125rem",
            }}
          >
            {isEditing ? t("Edit Transaction") : t("Add Transaction")}
          </Typography>
          <Box sx={{ width: 40 }} /> {/* Spacer for alignment */}
        </Box>

        {/* Type toggle chips */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Chip
            label={t("Expense")}
            icon={<RemoveRoundedIcon fontSize="small" />}
            onClick={() => handleTypeChange("expense")}
            color={formData.type === "expense" ? "error" : "default"}
            variant={formData.type === "expense" ? "filled" : "outlined"}
            disabled={isEditing}
            sx={{
              height: 36,
              fontSize: "0.875rem",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              px: 1,
              borderRadius: 4,
              "& .MuiChip-label": {
                px: 1,
              },
              "&.MuiChip-colorError": {
                backgroundColor: theme.palette.error.main,
                color: "#fff",
              },
            }}
          />
          <Chip
            label={t("Income")}
            icon={<AddRoundedIcon fontSize="small" />}
            onClick={() => handleTypeChange("income")}
            color={formData.type === "income" ? "success" : "default"}
            variant={formData.type === "income" ? "filled" : "outlined"}
            disabled={isEditing}
            sx={{
              height: 36,
              fontSize: "0.875rem",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              px: 1,
              borderRadius: 4,
              "& .MuiChip-label": {
                px: 1,
              },
              "&.MuiChip-colorSuccess": {
                backgroundColor: theme.palette.success.main,
                color: "#fff",
              },
            }}
          />
        </Box>
      </Box>

      {/* Amount input */}
      <Box
        sx={{
          p: 3,
          pt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor:
            formData.type === "income"
              ? alpha(theme.palette.success.main, 0.04)
              : alpha(theme.palette.error.main, 0.04),
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 400,
              fontSize: "1.5rem",
              color: theme.palette.text.secondary,
              mr: 1,
              mt: 0.5,
            }}
          >
            ₹
          </Typography>
          <TextField
            autoFocus={!isEditing}
            value={formData.amount}
            onChange={handleAmountChange}
            placeholder="0"
            variant="standard"
            inputProps={{
              style: {
                fontSize: "2.5rem",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 400,
                textAlign: "center",
                color:
                  formData.type === "income"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
              },
            }}
            sx={{
              "& .MuiInput-underline:before": { borderBottom: "none" },
              "& .MuiInput-underline:after": { borderBottom: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottom: "none",
              },
            }}
          />
        </Box>

        {errors.amount && (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.error.main,
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              mt: 1,
            }}
          >
            {errors.amount}
          </Typography>
        )}
      </Box>

      {/* Form fields */}
      <List sx={{ pt: 0 }}>
        {/* Category field */}
        <ListItem
          button
          onClick={() => setShowCategorySelector(true)}
          sx={{
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: selectedCategory
                  ? getAvatarColors(selectedCategory).bgColor
                  : alpha(theme.palette.action.active, 0.08),
                color: selectedCategory
                  ? getAvatarColors(selectedCategory).textColor
                  : theme.palette.text.secondary,
                fontSize: "0.875rem",
                fontWeight: 500,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
              }}
            >
              {selectedCategory ? (
                getCategoryInitials(selectedCategory.name)
              ) : (
                <CategoryRoundedIcon fontSize="small" />
              )}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 400,
                  fontSize: "1rem",
                }}
              >
                {selectedCategory ? selectedCategory.name : t("Category")}
              </Typography>
            }
            secondary={
              errors.category ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.error.main,
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  }}
                >
                  {errors.category}
                </Typography>
              ) : null
            }
          />
          <KeyboardArrowRightRoundedIcon color="action" />
        </ListItem>

        {/* Date field */}
        <ListItem
          button
          onClick={() => setShowDatePicker(true)}
          sx={{
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              }}
            >
              <CalendarTodayRoundedIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                sx={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 400,
                  fontSize: "1rem",
                }}
              >
                {formatDate(formData.date)}
              </Typography>
            }
          />
          <KeyboardArrowRightRoundedIcon color="action" />
        </ListItem>

        {/* Notes field */}
        <ListItem
          sx={{
            py: 2,
            alignItems: "flex-start",
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(theme.palette.action.active, 0.08),
                color: theme.palette.text.secondary,
              }}
            >
              <SubjectRoundedIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={t("Add notes (optional)")}
            value={formData.notes}
            onChange={handleNotesChange}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                fontSize: "1rem",
                p: 0,
              },
            }}
          />
        </ListItem>
      </List>

      {/* Error message */}
      {errors.submit && (
        <Box sx={{ px: 2, mt: 2 }}>
          <Typography
            color="error"
            variant="body2"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              p: 1.5,
              borderRadius: 2,
            }}
          >
            {errors.submit}
          </Typography>
        </Box>
      )}

      {/* Save button */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color={formData.type === "income" ? "success" : "error"}
          disabled={isSubmitting}
          onClick={handleSubmit}
          disableElevation
          sx={{
            borderRadius: 28,
            py: 1.5,
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "1rem",
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : isEditing ? (
            t("Update")
          ) : (
            t("Save")
          )}
        </Button>
      </Box>
    </>
  );

  // Category selector screen
  const renderCategorySelector = () => (
    <>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 5,
        }}
      >
        <IconButton
          onClick={() => setShowCategorySelector(false)}
          sx={{ mr: 2 }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "1.125rem",
          }}
        >
          {t("Select Category")}
        </Typography>
      </Box>

      {/* Categories list */}
      {loadingCategories ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredCategories.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              color: theme.palette.text.secondary,
            }}
          >
            {t("No categories available")}
          </Typography>
        </Box>
      ) : (
        <List sx={{ pt: 0 }}>
          {filteredCategories.map((category) => {
            const { bgColor, textColor } = getAvatarColors(category);
            const isSelected = formData.category === category._id;

            return (
              <ListItem
                key={category._id}
                button
                onClick={() => handleCategorySelect(category)}
                sx={{
                  py: 2,
                  backgroundColor: isSelected
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                }}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: bgColor,
                      color: textColor,
                      fontSize: "1rem",
                      fontWeight: 500,
                      fontFamily: '"Google Sans", "Roboto", sans-serif',
                    }}
                  >
                    {getCategoryInitials(category.name)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                        fontWeight: isSelected ? 500 : 400,
                        fontSize: "1rem",
                      }}
                    >
                      {category.name}
                    </Typography>
                  }
                />
                {isSelected && <CheckRoundedIcon color="primary" />}
              </ListItem>
            );
          })}

          {/* Add new category option */}
          <Divider sx={{ my: 1 }} />
          <ListItem button onClick={handleOpenAddCategoryModal} sx={{ py: 2 }}>
            <ListItemIcon sx={{ minWidth: 56 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                }}
              >
                <AddCircleRoundedIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    fontWeight: 500,
                    fontSize: "1rem",
                    color: theme.palette.primary.main,
                  }}
                >
                  {t("Add New Category")}
                </Typography>
              }
            />
          </ListItem>
        </List>
      )}
    </>
  );

  // Date picker screen
  const renderDatePicker = () => (
    <>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 5,
        }}
      >
        <IconButton onClick={() => setShowDatePicker(false)} sx={{ mr: 2 }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "1.125rem",
          }}
        >
          {t("Select Date")}
        </Typography>
      </Box>

      {/* Date picker */}
      <Box sx={{ p: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={formData.date}
            onChange={handleDateChange}
            renderInput={(params) => <div {...params} />}
            showToolbar={false}
            sx={{
              width: "100%",
              "& .MuiPickersDay-root": {
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                borderRadius: "50%",
              },
              "& .MuiPickersDay-root.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
              },
              "& .MuiTypography-root": {
                fontFamily: '"Google Sans", "Roboto", sans-serif',
              },
            }}
          />
        </LocalizationProvider>
      </Box>

      {/* Done button */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => setShowDatePicker(false)}
          disableElevation
          sx={{
            borderRadius: 28,
            py: 1.5,
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "1rem",
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            },
          }}
        >
          {t("Done")}
        </Button>
      </Box>
    </>
  );

  // Determine which screen to show
  const renderContent = () => {
    if (showCategorySelector) {
      return renderCategorySelector();
    } else if (showDatePicker) {
      return renderDatePicker();
    } else {
      return renderMainForm();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {renderContent()}
        </DialogContent>
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
