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
  ListSubheader,
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
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  Stack,
} from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  DeleteForever as DeleteIcon,
  FileDownload as ExportIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  updateUserProfile,
  changePassword,
  deleteAccount,
  exportData,
} from "../services/api";

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
                    <Stack direction="row" spacing={1}>
                      <Button
                        onClick={handleCancelEdit}
                        color="inherit"
                        startIcon={<CancelIcon />}
                      >
                        {t("Cancel")}
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        variant="contained"
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
                    </Stack>
                  ) : (
                    <IconButton edge="end" onClick={handleEditProfile}>
                      <EditIcon />
                    </IconButton>
                  )
                }
                sx={{
                  alignItems: "flex-start",
                  "& .MuiListItemSecondaryAction-root": {
                    top: profileEdit ? "16px" : "24px",
                  },
                }}
              >
                <ListItemIcon sx={{ mt: 0.5 }}>
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

        {/* Data Management Section */}
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
