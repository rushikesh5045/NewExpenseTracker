import React, { useState } from "react";
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
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "../services/api";

// Google-style icons
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError(t("Please enter your email address"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Failed to process your request. Please try again.")
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
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: 4,
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
              <EmailRoundedIcon fontSize="medium" />
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
              {t("Forgot password")}
            </Typography>
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
                    "If your email is registered, you will receive a password reset link shortly."
                  )}
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/login"
                fullWidth
                variant="contained"
                disableElevation
                sx={{
                  mt: 2,
                  mb: 2,
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
                }}
              >
                {t("Return to sign in")}
              </Button>
            </Box>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                  color: "text.secondary",
                  textAlign: "center",
                  mb: 3,
                }}
              >
                {t(
                  "Enter your email address and we'll send you a link to reset your password."
                )}
              </Typography>

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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label={t("Email address")}
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon color="action" fontSize="small" />
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
                  sx={{ mb: 1 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  disableElevation
                  sx={{
                    mt: 3,
                    mb: 2,
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
                      {t("Sending...")}
                    </Box>
                  ) : (
                    t("Send reset link")
                  )}
                </Button>

                <Box sx={{ mt: 3, textAlign: "center" }}>
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
                    {t("Back to sign in")}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Paper>

        {/* Footer - Terms and privacy */}
        <Box sx={{ textAlign: "center", mt: 4, opacity: 0.7, maxWidth: 420 }}>
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

export default ForgotPassword;
