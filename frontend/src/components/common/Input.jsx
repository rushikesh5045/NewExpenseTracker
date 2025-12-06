import React from "react";
import {
  TextField,
  InputAdornment,
  FormHelperText,
  Typography,
  Box,
} from "@mui/material";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  helperText,
  startAdornment,
  endAdornment,
  fullWidth = true,
  variant = "outlined",
  size = "medium",
  required = false,
  ...props
}) => {
  return (
    <Box sx={{ mb: 2.5 }}>
      {label && (
        <Typography
          component="label"
          htmlFor={name}
          variant="body2"
          sx={{
            display: "block",
            mb: 0.75,
            fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            fontWeight: 500,
            color: error ? "error.main" : "text.primary",
            fontSize: "0.875rem",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#d93025", marginLeft: "4px" }}>*</span>
          )}
        </Typography>
      )}

      <TextField
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error || helperText}
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        required={required}
        InputProps={{
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : null,
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : null,
          sx: {
            fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            borderRadius: 2, // 8px border radius like Google Pay
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#d93025" : "rgba(0, 0, 0, 0.23)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#d93025" : "rgba(0, 0, 0, 0.87)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
              borderColor: error ? "#d93025" : "#1a73e8",
            },
          },
        }}
        FormHelperTextProps={{
          sx: {
            fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            fontSize: "0.75rem",
            marginLeft: "4px",
            marginTop: "4px",
          },
        }}
        {...props}
      />
    </Box>
  );
};

export default Input;
