import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Fade,
  LinearProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { registerUser } from "../services/api";
import LanguageSelector from "../components/common/LanguageSelector";

// Google-style rounded icons
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const Register = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Calculate password strength
  useEffect(() => {
    if (!userData.password) {
      setPasswordStrength(0);
      return;
    }

    let score = 0;

    // Length check
    if (userData.password.length >= 8) score += 25;

    // Contains lowercase
    if (/[a-z]/.test(userData.password)) score += 25;

    // Contains uppercase
    if (/[A-Z]/.test(userData.password)) score += 25;

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(userData.password)) score += 25;

    setPasswordStrength(score);
  }, [userData.password]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!userData.name) {
      newErrors.name = t("Name is required");
    }

    if (!userData.email) {
      newErrors.email = t("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = t("Invalid email address");
    }

    if (!userData.password) {
      newErrors.password = t("Password is required");
    } else if (userData.password.length < 8) {
      newErrors.password = t("Password must be at least 8 characters");
    }

    if (!userData.confirmPassword) {
      newErrors.confirmPassword = t("Confirm password is required");
    } else if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = t("Passwords must match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      await registerUser(userData);
      navigate("/login", {
        state: { message: t("Registration successful! Please sign in.") },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            mb: 1,
          }}
        >
          <Button
            component={RouterLink}
            to="/login"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              textTransform: "none",
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 500,
              fontSize: "0.875rem",
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {t("Sign in")}
          </Button>
          <LanguageSelector />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              width: "100%",
              maxWidth: "420px",
              mx: "auto",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
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
                {t("Create account")}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  color: "text.secondary",
                }}
              >
                {t("to start managing your finances")}
              </Typography>
            </Box>

            {/* Error message */}
            {error && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                }}
              >
                <ErrorOutlineRoundedIcon
                  color="error"
                  sx={{ mr: 1.5, mt: 0.5 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    color: theme.palette.error.main,
                  }}
                >
                  {error}
                </Typography>
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Name field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                name="name"
                label={t("Name")}
                autoComplete="name"
                autoFocus
                value={userData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRoundedIcon
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
                sx={{ mb: 2.5 }}
              />

              {/* Email field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                name="email"
                label={t("Email")}
                autoComplete="email"
                value={userData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
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
                sx={{ mb: 2.5 }}
              />

              {/* Password field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("Password")}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={userData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon
                        color={errors.password ? "error" : "action"}
                        fontSize="small"
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
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
                sx={{ mb: 1 }}
              />

              {/* Password strength indicator */}
              {userData.password && (
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

              {/* Confirm Password field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label={t("Confirm Password")}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={userData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
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
                        aria-label="toggle confirm password visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                sx={{ mb: 1 }}
              />

              {/* Password match indicator */}
              {userData.confirmPassword && userData.password && (
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 2, ml: 1.5 }}
                >
                  {userData.confirmPassword === userData.password ? (
                    <>
                      <CheckCircleRoundedIcon
                        fontSize="small"
                        color="success"
                        sx={{ mr: 0.5, fontSize: "1rem" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily:
                            '"Google Sans Text", "Roboto", sans-serif',
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
                          fontFamily:
                            '"Google Sans Text", "Roboto", sans-serif',
                          color: theme.palette.error.main,
                        }}
                      >
                        {t("Passwords don't match")}
                      </Typography>
                    </>
                  )}
                </Box>
              )}

              {/* Create account button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                disableElevation
                sx={{
                  mt: 2,
                  mb: 3,
                  height: 48,
                  textTransform: "none",
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                  borderRadius: "24px", // Google Pay's pill-shaped buttons
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
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress
                      size={20}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    {t("Creating account...")}
                  </Box>
                ) : (
                  t("Create account")
                )}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Footer - Terms and privacy */}
        <Box sx={{ textAlign: "center", mt: 2, mb: 4, opacity: 0.7 }}>
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
            {t("By creating an account, you agree to our")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Link
              component={RouterLink}
              to="/terms"
              sx={{
                textDecoration: "none",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                color: "primary.main",
                fontSize: "0.75rem",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {t("Terms of Service")}
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
            <Link
              component={RouterLink}
              to="/privacy"
              sx={{
                textDecoration: "none",
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                color: "primary.main",
                fontSize: "0.75rem",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {t("Privacy Policy")}
            </Link>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
};

export default Register;
