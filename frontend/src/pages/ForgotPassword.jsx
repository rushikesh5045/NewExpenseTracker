// src/pages/ForgotPassword.jsx
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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "../services/api";

const ForgotPassword = () => {
  const { t } = useTranslation();
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
    <Container
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: "100%",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          {t("Forgot Password")}
        </Typography>

        {success ? (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {t(
                "If your email is registered, you will receive a password reset link shortly."
              )}
            </Alert>
            <Typography variant="body2" align="center">
              <Link component={RouterLink} to="/login">
                {t("Return to login")}
              </Link>
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 3 }}
            >
              {t(
                "Enter your email address and we'll send you a link to reset your password."
              )}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t("Email Address")}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  t("Send Reset Link")
                )}
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  {t("Back to Login")}
                </Link>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
