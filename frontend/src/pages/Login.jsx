import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import LanguageSelector from "../components/common/LanguageSelector";

// Google-style rounded icons
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuth();
  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email) {
      newErrors.email = t("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = t("Invalid email address");
    }

    if (!credentials.password) {
      newErrors.password = t("Password is required");
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
      const response = await loginUser(credentials);
      login(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Login failed. Please check your credentials.")
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, mb: 1 }}>
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
                {t("Sign in")}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  color: "text.secondary",
                }}
              >
                {t("to continue to your account")}
              </Typography>
            </Box>

            {/* Success message */}
            {location.state?.message && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                  backgroundColor: alpha(theme.palette.success.main, 0.08),
                }}
              >
                <CheckCircleRoundedIcon
                  color="success"
                  sx={{ mr: 1.5, mt: 0.5 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    color: theme.palette.text.primary,
                  }}
                >
                  {location.state.message}
                </Typography>
              </Box>
            )}

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
              {/* Email field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                name="email"
                label={t("Email")}
                autoComplete="email"
                autoFocus
                value={credentials.email}
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
                autoComplete="current-password"
                value={credentials.password}
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
              />

              {/* Forgot password link */}
              <Box sx={{ textAlign: "right", mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  style={{ textDecoration: "none" }}
                >
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
                      px: 0.5, // Add padding for better touch target
                      py: 0.5,
                      display: "inline-block",
                    }}
                  >
                    {t("Forgot password?")}
                  </Typography>
                </Link>
              </Box>

              {/* Sign in button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                disableElevation
                sx={{
                  mt: 3,
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
                    {t("Signing in...")}
                  </Box>
                ) : (
                  t("Sign in")
                )}
              </Button>

              {/* Divider */}
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

              {/* Register link */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    color: "text.secondary",
                  }}
                >
                  {t("Don't have an account?")}{" "}
                  <Link
                    component={RouterLink}
                    to="/register"
                    style={{ textDecoration: "none" }}
                  >
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
                      {t("Create account")}
                    </Typography>
                  </Link>
                </Typography>
              </Box>
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
            {t("By continuing, you agree to our")}
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

export default Login;
