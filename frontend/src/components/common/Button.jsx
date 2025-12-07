import React from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";

const Button = ({
  children,
  type = "button",
  variant = "contained",
  color = "primary",
  className = "",
  loading = false,
  fullWidth = false,
  size = "medium",
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <MuiButton
      type={type}
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      size={size}
      disabled={loading}
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : startIcon
      }
      endIcon={endIcon}
      sx={{
        textTransform: "none",
        fontFamily: '"Google Sans", "Roboto", sans-serif',
        fontWeight: 500,
        borderRadius: "20px",
        boxShadow: "none",
        "&:hover": {
          boxShadow:
            variant === "contained"
              ? "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)"
              : "none",
        },
        ...(variant === "outlined" && {
          borderWidth: "1px",
        }),
        ...(size === "small" && {
          fontSize: "0.8125rem",
          padding: "4px 16px",
        }),
        ...(size === "medium" && {
          fontSize: "0.875rem",
          padding: "8px 24px",
        }),
        ...(size === "large" && {
          fontSize: "0.9375rem",
          padding: "10px 32px",
        }),
        ...props.sx,
      }}
      className={className}
      {...props}
    >
      {loading ? "Loading..." : children}
    </MuiButton>
  );
};

export default Button;
