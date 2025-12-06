import React, { useState, useEffect } from "react";
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
  ListSubheader,
  Switch,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  DeleteForever as DeleteIcon,
  FileDownload as ExportIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  AttachMoney as CurrencyIcon,
  DateRange as DateFormatIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import LanguageSelector from "../components/common/LanguageSelector";
import {
  updateUserProfile,
  changePassword,
  deleteAccount,
  exportData,
} from "../services/api";

// Currency options
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
];

// Date format options
const dateFormats = [
  { code: "MM/DD/YYYY", name: "MM/DD/YYYY (US)" },
  { code: "DD/MM/YYYY", name: "DD/MM/YYYY (EU)" },
  { code: "YYYY-MM-DD", name: "YYYY-MM-DD (ISO)" },
];

const Settings = () => {
  const { t, i18n } = useTranslation();
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

  // State for preferences
  const [preferences, setPreferences] = useState({
    language: localStorage.getItem("language") || "en",
    currency: localStorage.getItem("currency") || "INR",
    currencySymbol: localStorage.getItem("currencySymbol") || "₹",
    theme: localStorage.getItem("theme") || "light",
    dateFormat: localStorage.getItem("dateFormat") || "MM/DD/YYYY",
  });

  // State for notifications
  const [notifications, setNotifications] = useState({
    email: localStorage.getItem("emailNotifications") === "true",
    push: localStorage.getItem("pushNotifications") === "true",
  });

  // State for dialogs
  const [dialogs, setDialogs] = useState({
    deleteAccount: false,
    clearData: false,
    exportData: false,
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State for errors
  const [errors, setErrors] = useState({});

  // Handle profile edit toggle
  const handleEditProfile = () => {
    setProfileEdit(!profileEdit);
    // Reset form data to current user data when toggling edit mode
    if (!profileEdit) {
      setProfileData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
      });
    }
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

  // Handle preference change
  const handlePreferenceChange = (name, value) => {
    setPreferences({
      ...preferences,
      [name]: value,
    });

    // Save to localStorage
    localStorage.setItem(name, value);

    // Handle special cases
    if (name === "language") {
      i18n.changeLanguage(value);
    } else if (name === "currency") {
      // Find the currency symbol
      const currency = currencies.find((c) => c.code === value);
      if (currency) {
        setPreferences((prev) => ({
          ...prev,
          currencySymbol: currency.symbol,
        }));
        localStorage.setItem("currencySymbol", currency.symbol);
      }
    } else if (name === "theme") {
      // Apply theme change (you'll need to implement theme switching)
      document.documentElement.setAttribute("data-theme", value);
    }

    // Show success notification
    setNotification({
      open: true,
      message: t("Preference updated"),
      severity: "success",
    });
  };

  // Handle notification toggle
  const handleNotificationToggle = (name) => {
    const newValue = !notifications[name];

    setNotifications({
      ...notifications,
      [name]: newValue,
    });

    // Save to localStorage
    localStorage.setItem(`${name}Notifications`, newValue.toString());

    // Show success notification
    setNotification({
      open: true,
      message: t("Notification settings updated"),
      severity: "success",
    });
  };

  // Handle dialog open/close
  const handleDialog = (dialog, open) => {
    setDialogs({
      ...dialogs,
      [dialog]: open,
    });
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
    <Container maxWidth="md" sx={{ pb: 7 }}>
      {/* Header */}
      <Box
        sx={{
          pt: 2,
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="medium">
          {t("Settings")}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Account Settings Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: theme.shape.borderRadius,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <List
              subheader={
                <ListSubheader
                  component="div"
                  sx={{ bgcolor: "background.paper" }}
                >
                  {t("Account Settings")}
                </ListSubheader>
              }
            >
              {/* Profile Information */}
              <ListItem
                secondaryAction={
                  profileEdit ? (
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      startIcon={
                        savingProfile ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      color="primary"
                    >
                      {savingProfile ? t("Saving...") : t("Save")}
                    </Button>
                  ) : (
                    <IconButton edge="end" onClick={handleEditProfile}>
                      <EditIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon>
                  <AccountIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Profile Information")}
                  secondary={
                    profileEdit ? (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          margin="dense"
                          id="name"
                          name="name"
                          label={t("Name")}
                          value={profileData.name}
                          onChange={handleProfileChange}
                          error={!!errors.name}
                          helperText={errors.name}
                          disabled={savingProfile}
                          size="small"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          margin="dense"
                          id="email"
                          name="email"
                          label={t("Email")}
                          value={profileData.email}
                          onChange={handleProfileChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          disabled={savingProfile}
                          size="small"
                        />
                      </Box>
                    ) : (
                      <>
                        <Typography variant="body2" component="div">
                          {t("Name")}: {currentUser?.name}
                        </Typography>
                        <Typography variant="body2" component="div">
                          {t("Email")}: {currentUser?.email}
                        </Typography>
                      </>
                    )
                  }
                />
              </ListItem>

              <Divider component="li" />

              {/* Change Password */}
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Change Password")}
                  secondary={
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        margin="dense"
                        id="currentPassword"
                        name="currentPassword"
                        label={t("Current Password")}
                        type={showPassword.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword}
                        disabled={changingPassword}
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  handleTogglePasswordVisibility("current")
                                }
                                edge="end"
                              >
                                {showPassword.current ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        margin="dense"
                        id="newPassword"
                        name="newPassword"
                        label={t("New Password")}
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword}
                        disabled={changingPassword}
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  handleTogglePasswordVisibility("new")
                                }
                                edge="end"
                              >
                                {showPassword.new ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        margin="dense"
                        id="confirmPassword"
                        name="confirmPassword"
                        label={t("Confirm New Password")}
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        disabled={changingPassword}
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  handleTogglePasswordVisibility("confirm")
                                }
                                edge="end"
                              >
                                {showPassword.confirm ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                        startIcon={
                          changingPassword ? (
                            <CircularProgress size={20} />
                          ) : null
                        }
                      >
                        {changingPassword
                          ? t("Changing...")
                          : t("Change Password")}
                      </Button>
                    </Box>
                  }
                />
              </ListItem>

              <Divider component="li" />

              {/* Delete Account */}
              <ListItem>
                <ListItemIcon>
                  <DeleteIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={t("Delete Account")}
                  secondary={t(
                    "Permanently delete your account and all your data"
                  )}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDialog("deleteAccount", true)}
                >
                  {t("Delete")}
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Preferences Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: theme.shape.borderRadius,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <List
              subheader={
                <ListSubheader
                  component="div"
                  sx={{ bgcolor: "background.paper" }}
                >
                  {t("Preferences")}
                </ListSubheader>
              }
            >
              {/* Language */}
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Language")}
                  secondary={t("Select your preferred language")}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={preferences.language}
                    onChange={(e) =>
                      handlePreferenceChange("language", e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">हिंदी</MenuItem>
                    <MenuItem value="mr">मराठी</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>

              <Divider component="li" />

              {/* Currency */}
              <ListItem>
                <ListItemIcon>
                  <CurrencyIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Currency")}
                  secondary={t("Select your preferred currency")}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={preferences.currency}
                    onChange={(e) =>
                      handlePreferenceChange("currency", e.target.value)
                    }
                    displayEmpty
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ListItem>

              <Divider component="li" />

              {/* Date Format */}
              <ListItem>
                <ListItemIcon>
                  <DateFormatIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Date Format")}
                  secondary={t("Select your preferred date format")}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={preferences.dateFormat}
                    onChange={(e) =>
                      handlePreferenceChange("dateFormat", e.target.value)
                    }
                    displayEmpty
                  >
                    {dateFormats.map((format) => (
                      <MenuItem key={format.code} value={format.code}>
                        {format.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ListItem>

              <Divider component="li" />

              {/* Theme */}
              <ListItem>
                <ListItemIcon>
                  <ThemeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Theme")}
                  secondary={t("Select light or dark theme")}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={preferences.theme}
                    onChange={(e) =>
                      handlePreferenceChange("theme", e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="light">{t("Light")}</MenuItem>
                    <MenuItem value="dark">{t("Dark")}</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Notifications & Data Management Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: theme.shape.borderRadius,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              mb: 3,
            }}
          >
            <List
              subheader={
                <ListSubheader
                  component="div"
                  sx={{ bgcolor: "background.paper" }}
                >
                  {t("Notifications")}
                </ListSubheader>
              }
            >
              {/* Email Notifications */}
              <ListItem>
                <ListItemIcon>
                  <NotificationIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Email Notifications")}
                  secondary={t("Receive important updates via email")}
                />
                <Switch
                  edge="end"
                  checked={notifications.email}
                  onChange={() => handleNotificationToggle("email")}
                />
              </ListItem>

              <Divider component="li" />

              {/* Push Notifications */}
              <ListItem>
                <ListItemIcon>
                  <NotificationIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Push Notifications")}
                  secondary={t("Receive notifications on your device")}
                />
                <Switch
                  edge="end"
                  checked={notifications.push}
                  onChange={() => handleNotificationToggle("push")}
                />
              </ListItem>
            </List>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: theme.shape.borderRadius,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <List
              subheader={
                <ListSubheader
                  component="div"
                  sx={{ bgcolor: "background.paper" }}
                >
                  {t("Data Management")}
                </ListSubheader>
              }
            >
              {/* Export Data */}
              <ListItem>
                <ListItemIcon>
                  <ExportIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Export Data")}
                  secondary={t("Download your data in CSV or PDF format")}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleDialog("exportData", true)}
                  startIcon={<ExportIcon />}
                >
                  {t("Export")}
                </Button>
              </ListItem>

              <Divider component="li" />

              {/* Clear Data */}
              <ListItem>
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Clear All Data")}
                  secondary={t("Delete all your transactions and categories")}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDialog("clearData", true)}
                >
                  {t("Clear")}
                </Button>
              </ListItem>

              <Divider component="li" />

              {/* Backup */}
              <ListItem>
                <ListItemIcon>
                  <BackupIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Backup & Restore")}
                  secondary={t("Create backups and restore your data")}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<BackupIcon />}
                >
                  {t("Backup")}
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* About & Help Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: theme.shape.borderRadius,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <List
              subheader={
                <ListSubheader
                  component="div"
                  sx={{ bgcolor: "background.paper" }}
                >
                  {t("About & Help")}
                </ListSubheader>
              }
            >
              {/* App Version */}
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText primary={t("App Version")} secondary="1.0.0" />
              </ListItem>

              <Divider component="li" />

              {/* Contact Support */}
              <ListItemButton component="a" href="mailto:support@example.com">
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("Contact Support")}
                  secondary="support@example.com"
                />
              </ListItemButton>

              <Divider component="li" />

              {/* Privacy Policy */}
              <ListItemButton
                component="a"
                href="/privacy-policy"
                target="_blank"
              >
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText primary={t("Privacy Policy")} />
              </ListItemButton>

              <Divider component="li" />

              {/* Terms of Service */}
              <ListItemButton
                component="a"
                href="/terms-of-service"
                target="_blank"
              >
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText primary={t("Terms of Service")} />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>
      </Grid>
      {/* Delete Account Dialog */}
      <Dialog
        open={dialogs.deleteAccount}
        onClose={() => handleDialog("deleteAccount", false)}
      >
        <DialogTitle>{t("Delete Account")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleDialog("deleteAccount", false)}
            color="primary"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            {t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog
        open={dialogs.clearData}
        onClose={() => handleDialog("clearData", false)}
      >
        <DialogTitle>{t("Clear All Data")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "Are you sure you want to clear all your data? This action cannot be undone and will delete all your transactions and categories."
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleDialog("clearData", false)}
            color="primary"
          >
            {t("Cancel")}
          </Button>
          <Button onClick={handleClearData} color="error" variant="contained">
            {t("Clear")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog
        open={dialogs.exportData}
        onClose={() => handleDialog("exportData", false)}
      >
        <DialogTitle>{t("Export Data")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Choose a format to export your data:")}
          </DialogContentText>
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={() => handleExport("CSV")}
              startIcon={<ExportIcon />}
            >
              CSV
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport("PDF")}
              startIcon={<ExportIcon />}
            >
              PDF
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleDialog("exportData", false)}
            color="primary"
          >
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
