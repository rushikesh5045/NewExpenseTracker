import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  updateUserProfile,
  changePassword,
  deleteAccount,
  exportData,
  clearAllData,
} from "../services/api";

import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";

const Settings = () => {
  const { t } = useTranslation();
  const { currentUser, updateUser, logout } = useAuth();
  const theme = useTheme();

  // State for profile section
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // State for dialogs
  const [dialogs, setDialogs] = useState({
    deleteAccount: false,
    clearData: false,
    exportData: false,
    changePassword: false,
  });

  // State for export options
  const [exportOptions, setExportOptions] = useState({
    rangeType: "month", // 'month', 'year', 'custom'
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    customStartDate: "",
    customEndDate: "",
  });
  const [exporting, setExporting] = useState(false);

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State for errors
  const [errors, setErrors] = useState({});

  // Calculate password strength
  React.useEffect(() => {
    if (!passwordData.newPassword) {
      setPasswordStrength(0);
      return;
    }

    let score = 0;

    // Length check
    if (passwordData.newPassword.length >= 8) score += 25;

    // Contains lowercase
    if (/[a-z]/.test(passwordData.newPassword)) score += 25;

    // Contains uppercase
    if (/[A-Z]/.test(passwordData.newPassword)) score += 25;

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) score += 25;

    setPasswordStrength(score);
  }, [passwordData.newPassword]);

  // Get color based on password strength
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return theme.palette.error.main;
    if (passwordStrength < 100) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  // Get text based on password strength
  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return t("weak");
    if (passwordStrength < 100) return t("medium");
    return t("strong");
  };

  // Handle profile edit toggle
  const handleEditProfile = () => {
    setProfileEdit(!profileEdit);
    // Reset form data to current user data when toggling edit mode
    if (!profileEdit) {
      setProfileData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
      });
      setErrors({});
    }
  };

  // Handle profile cancel edit
  const handleCancelEdit = () => {
    setProfileEdit(false);
    setErrors({});
  };

  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
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

  // Handle profile save
  const handleSaveProfile = async () => {
    // Validate form
    const newErrors = {};

    if (!profileData.name) {
      newErrors.name = t("name_is_required");
    }

    if (!profileData.email) {
      newErrors.email = t("email_is_required");
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = t("invalid_email_address");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSavingProfile(true);
      const response = await updateUserProfile(profileData);

      // Update auth context with new user data
      updateUser(response.data);

      // Show success notification
      setNotification({
        open: true,
        message: t("profile_updated_successfully"),
        severity: "success",
      });

      // Exit edit mode
      setProfileEdit(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({
        open: true,
        message: error.response?.data?.message || t("failed_to_update_profile"),
        severity: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
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

  // Toggle password visibility
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // Handle change password
  const handleChangePassword = async () => {
    // Validate form
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t("current_password_is_required");
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = t("new_password_is_required");
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t("password_must_be_at_least_8_characters");
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t("please_confirm_your_new_password");
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t("passwords_do_not_match");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordData);

      // Show success notification
      setNotification({
        open: true,
        message: t("password_changed_successfully"),
        severity: "success",
      });

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close dialog
      handleDialog("changePassword", false);
    } catch (error) {
      console.error("Error changing password:", error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message || t("failed_to_change_password"),
        severity: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle dialog open/close
  const handleDialog = (dialog, open) => {
    setDialogs({
      ...dialogs,
      [dialog]: open,
    });

    // Reset errors when opening/closing dialogs
    if (dialog === "changePassword" && open) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  };

  // Handle export data
  const handleExport = async (format) => {
    try {
      setExporting(true);

      // Calculate date range based on export options
      let startDate, endDate;

      if (exportOptions.rangeType === "month") {
        // Get start and end of selected month
        startDate = new Date(
          exportOptions.selectedYear,
          exportOptions.selectedMonth,
          1
        );
        endDate = new Date(
          exportOptions.selectedYear,
          exportOptions.selectedMonth + 1,
          0,
          23,
          59,
          59,
          999
        );
      } else if (exportOptions.rangeType === "year") {
        // Get start and end of selected year
        startDate = new Date(exportOptions.selectedYear, 0, 1);
        endDate = new Date(exportOptions.selectedYear, 11, 31, 23, 59, 59, 999);
      } else if (exportOptions.rangeType === "custom") {
        // Use custom date range
        if (!exportOptions.customStartDate || !exportOptions.customEndDate) {
          setNotification({
            open: true,
            message: t("please_select_date_range"),
            severity: "error",
          });
          setExporting(false);
          return;
        }
        startDate = new Date(exportOptions.customStartDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(exportOptions.customEndDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const response = await exportData(format, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with date range
      let filename = "expense-tracker";
      if (exportOptions.rangeType === "month") {
        const monthName = new Date(
          exportOptions.selectedYear,
          exportOptions.selectedMonth
        ).toLocaleString("en", { month: "short" });
        filename += `-${monthName}-${exportOptions.selectedYear}`;
      } else if (exportOptions.rangeType === "year") {
        filename += `-${exportOptions.selectedYear}`;
      } else {
        filename += `-custom-range`;
      }
      filename += `.${format.toLowerCase()}`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Close dialog
      handleDialog("exportData", false);

      // Show success notification
      setNotification({
        open: true,
        message: t("data_exported_successfully"),
        severity: "success",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      setNotification({
        open: true,
        message: t("failed_to_export_data"),
        severity: "error",
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();

      // Logout user
      logout();

      // This will happen automatically due to the protected route
    } catch (error) {
      console.error("Error deleting account:", error);
      setNotification({
        open: true,
        message: t("failed_to_delete_account"),
        severity: "error",
      });

      // Close dialog
      handleDialog("deleteAccount", false);
    }
  };

  // Handle clear all data
  const handleClearData = async () => {
    try {
      // Call clear data API
      await clearAllData();

      // Dispatch event to refresh other components
      window.dispatchEvent(new CustomEvent("transactionChanged"));

      // Show success notification
      setNotification({
        open: true,
        message: t("all_data_cleared_successfully"),
        severity: "success",
      });

      // Close dialog
      handleDialog("clearData", false);
    } catch (error) {
      console.error("Error clearing data:", error);
      setNotification({
        open: true,
        message: t("failed_to_clear_data"),
        severity: "error",
      });

      // Close dialog
      handleDialog("clearData", false);
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <Container maxWidth="md" sx={{ pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          pt: 2,
          pb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 400,
            fontSize: "1.5rem",
          }}
        >
          {t("settings")}
        </Typography>
      </Box>

      {/* Profile Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
            {t("account")}
          </Typography>
        </Box>

        {profileEdit ? (
          // Edit profile form
          <Box sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                mb: 2,
              }}
            >
              {t("edit_profile")}
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              id="name"
              name="name"
              label={t("name")}
              value={profileData.name}
              onChange={handleProfileChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={savingProfile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleRoundedIcon
                      color={errors.name ? "error" : "action"}
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  height: 56, // Taller input for better touch targets
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  mt: 0.5,
                  ml: 1.5,
                },
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              margin="normal"
              id="email"
              name="email"
              label={t("email")}
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={savingProfile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon
                      color={errors.email ? "error" : "action"}
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  height: 56, // Taller input for better touch targets
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  mt: 0.5,
                  ml: 1.5,
                },
              }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                onClick={handleCancelEdit}
                color="inherit"
                startIcon={<CloseRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  borderRadius: "20px",
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                variant="contained"
                disableElevation
                startIcon={
                  savingProfile ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveRoundedIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  borderRadius: "20px",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow:
                      "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
                  },
                }}
              >
                {savingProfile ? t("saving") : t("save")}
              </Button>
            </Box>
          </Box>
        ) : (
          // Profile display
          <List disablePadding>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={handleEditProfile}>
                  <EditRoundedIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <AccountCircleRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary={currentUser?.name}
                secondary={currentUser?.email}
                primaryTypographyProps={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 400,
                }}
                secondaryTypographyProps={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                }}
              />
            </ListItem>

            <Divider />

            <ListItemButton
              onClick={() => handleDialog("changePassword", true)}
            >
              <ListItemIcon>
                <SecurityRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary={t("password")}
                secondary={t("change_your_password")}
                primaryTypographyProps={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 400,
                }}
                secondaryTypographyProps={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                }}
              />
              <KeyboardArrowRightRoundedIcon color="action" />
            </ListItemButton>

            <Divider />

            <ListItemButton onClick={() => handleDialog("deleteAccount", true)}>
              <ListItemIcon>
                <DeleteForeverRoundedIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary={t("Delete account")}
                secondary={t(
                  "Permanently delete your account and all your data"
                )}
                primaryTypographyProps={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 400,
                  color: theme.palette.error.main,
                }}
                secondaryTypographyProps={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                }}
              />
              <KeyboardArrowRightRoundedIcon color="action" />
            </ListItemButton>
          </List>
        )}
      </Paper>

      {/* Data Management Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
            {t("data_management")}
          </Typography>
        </Box>

        <List disablePadding>
          <ListItemButton onClick={() => handleDialog("exportData", true)}>
            <ListItemIcon>
              <FileDownloadRoundedIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("export_data")}
              secondary={t("download_your_data_in_csv_or_pdf_format")}
              primaryTypographyProps={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 400,
              }}
              secondaryTypographyProps={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              }}
            />
            <KeyboardArrowRightRoundedIcon color="action" />
          </ListItemButton>

          <Divider />

          <ListItemButton onClick={() => handleDialog("clearData", true)}>
            <ListItemIcon>
              <DeleteForeverRoundedIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("clear_all_data")}
              secondary={t("delete_all_your_transactions_and_categories")}
              primaryTypographyProps={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 400,
              }}
              secondaryTypographyProps={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              }}
            />
            <KeyboardArrowRightRoundedIcon color="action" />
          </ListItemButton>
        </List>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog
        open={dialogs.changePassword}
        onClose={() => handleDialog("changePassword", false)}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 3,
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 400,
            fontSize: "1.25rem",
          }}
        >
          {t("change_password")}
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, pb: 3 }}>
          <TextField
            fullWidth
            margin="normal"
            id="currentPassword"
            name="currentPassword"
            label={t("current_password")}
            type={showPassword.current ? "text" : "password"}
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
            disabled={changingPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon
                    color={errors.currentPassword ? "error" : "action"}
                    fontSize="small"
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility("current")}
                    edge="end"
                    size="small"
                  >
                    {showPassword.current ? (
                      <VisibilityOffRoundedIcon />
                    ) : (
                      <VisibilityRoundedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                height: 56,
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              },
            }}
            FormHelperTextProps={{
              sx: {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                mt: 0.5,
                ml: 1.5,
              },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            margin="normal"
            id="newPassword"
            name="newPassword"
            label={t("new_password")}
            type={showPassword.new ? "text" : "password"}
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            disabled={changingPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon
                    color={errors.newPassword ? "error" : "action"}
                    fontSize="small"
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility("new")}
                    edge="end"
                    size="small"
                  >
                    {showPassword.new ? (
                      <VisibilityOffRoundedIcon />
                    ) : (
                      <VisibilityRoundedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                height: 56,
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              },
            }}
            FormHelperTextProps={{
              sx: {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                mt: 0.5,
                ml: 1.5,
              },
            }}
            sx={{ mb: 1 }}
          />

          {/* Password strength indicator */}
          {passwordData.newPassword && (
            <Box sx={{ mb: 2, px: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    color: "text.secondary",
                  }}
                >
                  {t("password_strength")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    color: getPasswordStrengthColor(),
                    fontWeight: 500,
                  }}
                >
                  {getPasswordStrengthText()}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(getPasswordStrengthColor(), 0.2),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getPasswordStrengthColor(),
                  },
                }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            margin="normal"
            id="confirmPassword"
            name="confirmPassword"
            label={t("confirm_new_password")}
            type={showPassword.confirm ? "text" : "password"}
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={changingPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon
                    color={errors.confirmPassword ? "error" : "action"}
                    fontSize="small"
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility("confirm")}
                    edge="end"
                    size="small"
                  >
                    {showPassword.confirm ? (
                      <VisibilityOffRoundedIcon />
                    ) : (
                      <VisibilityRoundedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                height: 56,
              },
            }}
            InputLabelProps={{
              sx: {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              },
            }}
            FormHelperTextProps={{
              sx: {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                mt: 0.5,
                ml: 1.5,
              },
            }}
            sx={{ mb: 1 }}
          />

          {/* Password match indicator */}
          {passwordData.confirmPassword && passwordData.newPassword && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, ml: 1.5 }}>
              {passwordData.confirmPassword === passwordData.newPassword ? (
                <>
                  <CheckCircleRoundedIcon
                    fontSize="small"
                    color="success"
                    sx={{ mr: 0.5, fontSize: "1rem" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                      color: theme.palette.success.main,
                    }}
                  >
                    {t("passwords_match")}
                  </Typography>
                </>
              ) : (
                <>
                  <ErrorOutlineRoundedIcon
                    fontSize="small"
                    color="error"
                    sx={{ mr: 0.5, fontSize: "1rem" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                      color: theme.palette.error.main,
                    }}
                  >
                    {t("passwords_don_t_match")}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => handleDialog("changePassword", false)}
            color="inherit"
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
              boxShadow: "none",
              "&:hover": {
                boxShadow:
                  "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
              },
            }}
            startIcon={
              changingPassword ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {changingPassword ? t("changing") : t("change_password")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={dialogs.deleteAccount}
        onClose={() => handleDialog("deleteAccount", false)}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 3,
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 400,
            fontSize: "1.25rem",
            color: theme.palette.error.main,
          }}
        >
          {t("Delete account")}
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              p: 2,
              borderRadius: 2,
              mb: 2,
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            }}
          >
            <ErrorOutlineRoundedIcon color="error" sx={{ mr: 1.5, mt: 0.5 }} />
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: theme.palette.text.primary,
              }}
            >
              {t(
                "This action cannot be undone. Your account and all associated data will be permanently deleted."
              )}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              color: theme.palette.text.secondary,
              mt: 1,
            }}
          >
            {t("are_you_sure_you_want_to_proceed")}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => handleDialog("deleteAccount", false)}
            color="inherit"
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
              boxShadow: "none",
              "&:hover": {
                boxShadow:
                  "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
              },
            }}
          >
            {t("Delete account")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog
        open={dialogs.clearData}
        onClose={() => handleDialog("clearData", false)}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 3,
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 400,
            fontSize: "1.25rem",
          }}
        >
          {t("clear_all_data")}
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              p: 2,
              borderRadius: 2,
              mb: 2,
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
            }}
          >
            <ErrorOutlineRoundedIcon
              sx={{ mr: 1.5, mt: 0.5, color: theme.palette.warning.main }}
            />
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: theme.palette.text.primary,
              }}
            >
              {t(
                "This action will delete all your transactions and categories. Your account will remain active."
              )}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              color: theme.palette.text.secondary,
              mt: 1,
            }}
          >
            {t("are_you_sure_you_want_to_clear_all_data")}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => handleDialog("clearData", false)}
            color="inherit"
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleClearData}
            color="warning"
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
              boxShadow: "none",
              "&:hover": {
                boxShadow:
                  "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
              },
            }}
          >
            {t("clear_data")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog with date range options */}
      <Dialog
        open={dialogs.exportData}
        onClose={() => !exporting && handleDialog("exportData", false)}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 3,
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 400,
            fontSize: "1.25rem",
          }}
        >
          {t("export_data")}
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, pb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              color: theme.palette.text.secondary,
              mb: 3,
            }}
          >
            {t("select_date_range_and_format")}
          </Typography>

          {/* Date Range Type Selector */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                mb: 1.5,
                color: theme.palette.text.primary,
              }}
            >
              {t("date_range")}
            </Typography>
            <ToggleButtonGroup
              value={exportOptions.rangeType}
              exclusive
              onChange={(e, value) =>
                value &&
                setExportOptions({ ...exportOptions, rangeType: value })
              }
              fullWidth
              sx={{
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  py: 1,
                  borderRadius: "12px !important",
                  mx: 0.5,
                  border: "1px solid",
                  borderColor: theme.palette.divider,
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                },
              }}
            >
              <ToggleButton value="month">
                <CalendarMonthRoundedIcon
                  sx={{ mr: 0.5, fontSize: "1.1rem" }}
                />
                {t("month")}
              </ToggleButton>
              <ToggleButton value="year">
                <DateRangeRoundedIcon sx={{ mr: 0.5, fontSize: "1.1rem" }} />
                {t("year")}
              </ToggleButton>
              <ToggleButton value="custom">{t("custom")}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Month/Year Selectors */}
          {(exportOptions.rangeType === "month" ||
            exportOptions.rangeType === "year") && (
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              {exportOptions.rangeType === "month" && (
                <FormControl fullWidth size="small">
                  <InputLabel>{t("month")}</InputLabel>
                  <Select
                    value={exportOptions.selectedMonth}
                    label={t("month")}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        selectedMonth: e.target.value,
                      })
                    }
                    sx={{
                      borderRadius: 2,
                      fontFamily: '"Google Sans", "Roboto", sans-serif',
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i} value={i}>
                        {new Date(2000, i).toLocaleString(
                          localStorage.getItem("language") || "en",
                          { month: "long" }
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl fullWidth size="small">
                <InputLabel>{t("year")}</InputLabel>
                <Select
                  value={exportOptions.selectedYear}
                  label={t("year")}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      selectedYear: e.target.value,
                    })
                  }
                  sx={{
                    borderRadius: 2,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Custom Date Range */}
          {exportOptions.rangeType === "custom" && (
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                label={t("start_date")}
                type="date"
                size="small"
                fullWidth
                value={exportOptions.customStartDate}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    customStartDate: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                  },
                }}
              />
              <TextField
                label={t("end_date")}
                type="date"
                size="small"
                fullWidth
                value={exportOptions.customEndDate}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    customEndDate: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                  },
                }}
              />
            </Box>
          )}

          {/* Export Format Buttons */}
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              mb: 1.5,
              color: theme.palette.text.primary,
            }}
          >
            {t("format")}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              onClick={() => handleExport("CSV")}
              variant="outlined"
              disabled={exporting}
              startIcon={
                exporting ? (
                  <CircularProgress size={16} />
                ) : (
                  <GridOnRoundedIcon />
                )
              }
              sx={{
                textTransform: "none",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                borderRadius: "20px",
                px: 3,
                flex: 1,
              }}
            >
              CSV
            </Button>

            <Button
              onClick={() => handleExport("PDF")}
              variant="contained"
              disabled={exporting}
              disableElevation
              startIcon={
                exporting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PictureAsPdfRoundedIcon />
                )
              }
              sx={{
                textTransform: "none",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                borderRadius: "20px",
                px: 3,
                flex: 1,
                boxShadow: "none",
                "&:hover": {
                  boxShadow:
                    "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
                },
              }}
            >
              PDF
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button
            onClick={() => handleDialog("exportData", false)}
            color="inherit"
            disabled={exporting}
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
            }}
          >
            {t("cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 8 }} // Add margin to avoid bottom nav
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            borderRadius: 2,
            "& .MuiAlert-message": {
              fontFamily: '"Google Sans", "Roboto", sans-serif',
            },
          }}
          iconMapping={{
            success: <CheckCircleRoundedIcon fontSize="inherit" />,
            error: <ErrorOutlineRoundedIcon fontSize="inherit" />,
            warning: <ErrorOutlineRoundedIcon fontSize="inherit" />,
            info: <InfoRoundedIcon fontSize="inherit" />,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
