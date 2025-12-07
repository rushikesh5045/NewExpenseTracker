import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Fade,
  LinearProgress,
} from "@mui/material";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { validateResetToken, resetPassword } from "../services/api";

import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const checkToken = async () => {
      try {
        await validateResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    checkToken();
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 25;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 25;

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;

    setPasswordStrength(score);
  }, [password]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!password) {
      setError(t("password_is_required"));
      return;
    }

    if (password.length < 8) {
      setError(t("password_must_be_at_least_8_characters"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      await resetPassword(token, password);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("failed_to_reset_password_please_try_again")
      );
    } finally {
      setLoading(false);
    }
  };

  // Validating token state
  if (validatingToken) {
    return (
      <Fade in={true}>
        <Container
          maxWidth="sm"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ textAlign: "center", width: "100%", maxWidth: 400 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mx: "auto",
                mb: 3,
              }}
            >
              <LockResetRoundedIcon fontSize="medium" />
            </Box>
            <CircularProgress size={36} sx={{ mb: 2 }} />
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 400,
              }}
            >
              {t("validating_your_reset_link")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              }}
            >
              {t("this_will_only_take_a_moment")}
            </Typography>
          </Box>
        </Container>
      </Fade>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <Fade in={true}>
        <Container
          maxWidth="sm"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: 3 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              width: "100%",
              maxWidth: "420px",
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
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <ErrorOutlineRoundedIcon fontSize="medium" />
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
                {t("invalid_or_expired_link")}
              </Typography>
            </Box>

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
                  color: theme.palette.text.primary,
                }}
              >
                {t("this_password_reset_link_is_invalid_or_has_expired")}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Button
                component={RouterLink}
                to="/forgot-password"
                variant="contained"
                disableElevation
                sx={{
                  mt: 1,
                  mb: 2,
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
                }}
              >
                {t("request_new_reset_link")}
              </Button>

              <Box sx={{ mt: 3 }}>
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
                  {t("back_to_sign_in")}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Fade>
    );
  }

  // Valid token - reset password form
  return (
    <Fade in={true}>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: "420px",
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
              <LockResetRoundedIcon fontSize="medium" />
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
              {t("reset_your_password")}
            </Typography>
            {!success && (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  color: "text.secondary",
                }}
              >
                {t("create_a_new_password_for_your_account")}
              </Typography>
            )}
          </Box>

          {success ? (
            <Box sx={{ mt: 2 }}>
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
                  {t(
                    "Your password has been reset successfully! Redirecting to sign in..."
                  )}
                </Typography>
              </Box>

              <LinearProgress
                sx={{
                  mt: 3,
                  mb: 2,
                  borderRadius: 1,
                  height: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }}
              />
            </Box>
          ) : (
            <>
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
                {/* New Password field */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label={t("new_password")}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon color="action" fontSize="small" />
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
                {password && (
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
                          fontFamily:
                            '"Google Sans Text", "Roboto", sans-serif',
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
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label={t("confirm_new_password")}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon color="action" fontSize="small" />
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
                {confirmPassword && password && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      ml: 1.5,
                    }}
                  >
                    {confirmPassword === password ? (
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
                            fontFamily:
                              '"Google Sans Text", "Roboto", sans-serif',
                            color: theme.palette.error.main,
                          }}
                        >
                          {t("passwords_don_t_match")}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}

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
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      {t("resetting")}
                    </Box>
                  ) : (
                    t("Reset password")
                  )}
                </Button>

                <Box sx={{ textAlign: "center" }}>
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
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                    }}
                  >
                    {t("back_to_sign_in")}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Fade>
  );
};

export default ResetPassword;
