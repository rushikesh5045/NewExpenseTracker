// src/components/dashboard/DatePickerDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon, Today as TodayIcon } from "@mui/icons-material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";

const DatePickerDialog = ({
  open,
  onClose,
  selectedDate,
  onDateChange,
  viewType,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tempDate, setTempDate] = useState(selectedDate);

  // Handle date change in the calendar
  const handleDateChange = (newDate) => {
    setTempDate(newDate);
  };

  // Handle apply button click
  const handleApply = () => {
    onDateChange(tempDate);
    onClose();
  };

  // Handle today button click
  const handleToday = () => {
    const today = new Date();
    setTempDate(today);
    onDateChange(today);
    onClose();
  };

  // Get dialog title based on view type
  const getDialogTitle = () => {
    switch (viewType) {
      case "day":
        return t("Select Day");
      case "month":
        return t("Select Month");
      case "year":
        return t("Select Year");
      default:
        return t("Select Date");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: theme.shape.borderRadius,
          width: "100%",
          maxWidth: "360px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{getDialogTitle()}</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            date={tempDate}
            onChange={handleDateChange}
            views={
              viewType === "year"
                ? ["year"]
                : viewType === "month"
                ? ["year", "month"]
                : ["year", "month", "day"]
            }
          />
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
        <Button onClick={handleToday} color="primary" startIcon={<TodayIcon />}>
          {t("Today")}
        </Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          {t("Apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatePickerDialog;
