import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  FormHelperText,
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

const LoginForm = ({ onLogin, loading, error }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t("invalid_email_address"))
        .required(t("email_is_required")),
      password: Yup.string().required(t("password_is_required")),
    }),
    onSubmit: (values) => {
      onLogin(values);
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Fade in={true} timeout={500}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "420px",
          mx: "auto",
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 1px 3px rgba(0,0,0,0.08)"
              : "none",
        }}
      >
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          {/* Header with icon */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                mx: "auto",
                mb: 2,
              }}
            >
              <AccountCircleRoundedIcon fontSize="medium" />
            </Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 400,
                fontSize: "1.5rem",
                color: "text.primary",
                mb: 1,
              }}
            >
              {t("sign_in")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: "text.secondary",
              }}
            >
              {t("to_continue_to_your_account")}
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
            <Alert
              severity="error"
              icon={<ErrorOutlineRoundedIcon fontSize="inherit" />}
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                },
                "& .MuiAlert-icon": {
                  color: theme.palette.error.main,
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label={t("email")}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              placeholder={t("enter_your_email")}
              variant="outlined"
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon
                      color={
                        formik.touched.email && Boolean(formik.errors.email)
                          ? "error"
                          : "action"
                      }
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
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label={t("password")}
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              placeholder={t("enter_your_password")}
              variant="outlined"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon
                      color={
                        formik.touched.password &&
                        Boolean(formik.errors.password)
                          ? "error"
                          : "action"
                      }
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                      sx={{ color: theme.palette.action.active }}
                    >
                      {showPassword ? (
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
            />

            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    color: "primary.main",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                    px: 1, // Add padding for better touch target
                    py: 0.5,
                    display: "inline-block",
                  }}
                >
                  {t("forgot_password")}
                </Typography>
              </Link>
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disableElevation
            disabled={loading}
            sx={{
              mt: 2,
              mb: 3,
              height: 48,
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "0.9375rem",
              borderRadius: "24px",
              boxShadow: "none",
              "&:hover": {
                boxShadow:
                  "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
              },
              "&:disabled": {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.primary.main, 0.5)
                    : alpha(theme.palette.primary.main, 0.3),
                color: "#fff",
              },
              position: "relative",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                {t("signing_in")}
              </Box>
            ) : (
              t("sign_in")
            )}
          </Button>

          <Divider
            sx={{
              my: 3,
              "&::before, &::after": {
                borderColor:
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.08)"
                    : "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: "text.secondary",
                px: 1,
                fontSize: "0.75rem",
              }}
            >
              {t("or")}
            </Typography>
          </Divider>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: "text.secondary",
              }}
            >
              {t("don_t_have_an_account")}{" "}
              <Link to="/register" style={{ textDecoration: "none" }}>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    color: "primary.main",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                    px: 0.5, // Add padding for better touch target
                    py: 0.5,
                    display: "inline-block",
                  }}
                >
                  {t("create_account")}
                </Typography>
              </Link>
            </Typography>
          </Box>

          {/* Footer - Terms and privacy */}
          <Box sx={{ textAlign: "center", mt: 4, opacity: 0.7 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: "text.secondary",
                fontSize: "0.75rem",
                display: "block",
                mb: 0.5,
              }}
            >
              {t("by_continuing,_you_agree_to_our")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Link to="/terms" style={{ textDecoration: "none" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    color: "primary.main",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {t("terms_of_service")}
                </Typography>
              </Link>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  color: "text.secondary",
                }}
              >
                •
              </Typography>
              <Link to="/privacy" style={{ textDecoration: "none" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    color: "primary.main",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {t("privacy_policy")}
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default LoginForm;
