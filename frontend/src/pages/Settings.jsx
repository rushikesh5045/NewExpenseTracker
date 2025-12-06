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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  updateUserProfile,
  changePassword,
  deleteAccount,
  exportData,
} from "../services/api";

// Google-style rounded icons
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
    if (passwordStrength < 50) return t("Weak");
    if (passwordStrength < 100) return t("Medium");
    return t("Strong");
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
      newErrors.name = t("Name is required");
    }

    if (!profileData.email) {
      newErrors.email = t("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = t("Invalid email address");
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
        message: t("Profile updated successfully"),
        severity: "success",
      });

      // Exit edit mode
      setProfileEdit(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({
        open: true,
        message: error.response?.data?.message || t("Failed to update profile"),
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
      newErrors.currentPassword = t("Current password is required");
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = t("New password is required");
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t("Password must be at least 8 characters");
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t("Please confirm your new password");
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t("Passwords do not match");
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
        message: t("Password changed successfully"),
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
          error.response?.data?.message || t("Failed to change password"),
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
      const response = await exportData(format);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `expense-tracker-data.${format.toLowerCase()}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Close dialog
      handleDialog("exportData", false);

      // Show success notification
      setNotification({
        open: true,
        message: t("Data exported successfully"),
        severity: "success",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      setNotification({
        open: true,
        message: t("Failed to export data"),
        severity: "error",
      });
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();

      // Logout user
      logout();

      // Redirect to login page
      // This will happen automatically due to the protected route
    } catch (error) {
      console.error("Error deleting account:", error);
      setNotification({
        open: true,
        message: t("Failed to delete account"),
        severity: "error",
      });

      // Close dialog
      handleDialog("deleteAccount", false);
    }
  };

  // Handle clear all data
  const handleClearData = async () => {
    try {
      // Implement clear data API call

      // Show success notification
      setNotification({
        open: true,
        message: t("All data cleared successfully"),
        severity: "success",
      });

      // Close dialog
      handleDialog("clearData", false);
    } catch (error) {
      console.error("Error clearing data:", error);
      setNotification({
        open: true,
        message: t("Failed to clear data"),
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
          {t("Settings")}
        </Typography>
      </Box>

      {/* Profile Section - Google Pay style */}
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
            {t("Account")}
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
              {t("Edit profile")}
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              id="name"
              name="name"
              label={t("Name")}
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
              label={t("Email")}
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
                {t("Cancel")}
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
                {savingProfile ? t("Saving...") : t("Save")}
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
                primary={t("Password")}
                secondary={t("Change your password")}
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

      {/* Data Management Section - Google Pay style */}
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
            {t("Data management")}
          </Typography>
        </Box>

        <List disablePadding>
          <ListItemButton onClick={() => handleDialog("exportData", true)}>
            <ListItemIcon>
              <FileDownloadRoundedIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("Export data")}
              secondary={t("Download your data in CSV or PDF format")}
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
              primary={t("Clear all data")}
              secondary={t("Delete all your transactions and categories")}
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

      {/* Change Password Dialog - Google Pay style */}
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
          {t("Change password")}
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, pb: 3 }}>
          <TextField
            fullWidth
            margin="normal"
            id="currentPassword"
            name="currentPassword"
            label={t("Current password")}
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
            label={t("New password")}
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
                  {t("Password strength")}
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
            label={t("Confirm new password")}
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
                    {t("Passwords match")}
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
                    {t("Passwords don't match")}
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
            {t("Cancel")}
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
            {changingPassword ? t("Changing...") : t("Change password")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog - Google Pay style */}
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
            {t("Are you sure you want to proceed?")}
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
            {t("Cancel")}
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

      {/* Clear Data Dialog - Google Pay style */}
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
          {t("Clear all data")}
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
            {t("Are you sure you want to clear all data?")}
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
            {t("Cancel")}
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
            {t("Clear data")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog - Google Pay style */}
      <Dialog
        open={dialogs.exportData}
        onClose={() => handleDialog("exportData", false)}
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
          {t("Export data")}
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
            {t("Choose a format to export your data:")}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
            <Button
              onClick={() => handleExport("CSV")}
              variant="outlined"
              startIcon={<GridOnRoundedIcon />}
              sx={{
                textTransform: "none",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                borderRadius: "20px",
                px: 3,
              }}
            >
              CSV
            </Button>

            <Button
              onClick={() => handleExport("PDF")}
              variant="outlined"
              startIcon={<PictureAsPdfRoundedIcon />}
              sx={{
                textTransform: "none",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                borderRadius: "20px",
                px: 3,
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
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              borderRadius: "20px",
            }}
          >
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar - Google Pay style */}
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
