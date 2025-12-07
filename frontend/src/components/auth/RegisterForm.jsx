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
  Stepper,
  Step,
  StepLabel,
  alpha,
  LinearProgress,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const RegisterForm = ({ onRegister, loading, error }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t("name_is_required")),
      email: Yup.string()
        .email(t("invalid_email_address"))
        .required(t("email_is_required")),
      password: Yup.string()
        .min(8, t("password_must_be_at_least_8_characters"))
        .required(t("password_is_required")),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], t("passwords_must_match"))
        .required(t("confirm_password_is_required")),
    }),
    onSubmit: (values) => {
      onRegister(values);
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 25;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 25;

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;

    return score;
  };

  // Update password strength when password changes
  React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formik.values.password));
  }, [formik.values.password]);

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
              {t("create_account")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                color: "text.secondary",
              }}
            >
              {t("to_start_managing_your_finances")}
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
            {/* Name field */}
            <TextField
              fullWidth
              id="name"
              name="name"
              label={t("name")}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              placeholder={t("enter_your_name")}
              variant="outlined"
              autoComplete="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon
                      color={
                        formik.touched.name && Boolean(formik.errors.name)
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

            {/* Email field */}
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
              sx={{ mb: 2.5 }}
            />

            {/* Password field */}
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
              placeholder={t("create_a_password")}
              variant="outlined"
              autoComplete="new-password"
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
            {formik.values.password && (
              <Box sx={{ mb: 2.5, px: 1.5 }}>
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

            {/* Confirm Password field */}
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label={t("confirm_password")}
              type={showConfirmPassword ? "text" : "password"}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              placeholder={t("confirm_your_password")}
              variant="outlined"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon
                      color={
                        formik.touched.confirmPassword &&
                        Boolean(formik.errors.confirmPassword)
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
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                      size="small"
                      sx={{ color: theme.palette.action.active }}
                    >
                      {showConfirmPassword ? (
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
            {formik.values.confirmPassword && formik.values.password && (
              <Box
                sx={{ display: "flex", alignItems: "center", mb: 2, ml: 1.5 }}
              >
                {formik.values.confirmPassword === formik.values.password ? (
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
                {t("creating_account")}
              </Box>
            ) : (
              t("create_account")
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
              {t("already_have_an_account")}{" "}
              <Link to="/login" style={{ textDecoration: "none" }}>
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
                  {t("Sign in instead")}
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
              {t("by_creating_an_account,_you_agree_to_our")}
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

export default RegisterForm;
