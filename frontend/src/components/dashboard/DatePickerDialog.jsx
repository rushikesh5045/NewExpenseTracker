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
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";

// Use rounded Material Icons for Google Pay style
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";

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
        elevation: 2,
        sx: {
          borderRadius: 3, // More rounded corners for Google Pay style
          width: "100%",
          maxWidth: "360px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)", // Google Pay's shadow style
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "1.125rem",
            color: theme.palette.text.primary,
          }}
        >
          {getDialogTitle()}
        </Typography>
        <IconButton
          edge="end"
          onClick={onClose}
          aria-label="close"
          sx={{
            color:
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.54)"
                : "rgba(255,255,255,0.7)",
            padding: "8px",
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: 0,
          "&.MuiDialogContent-dividers": {
            borderTop: "none",
            borderBottom: "none",
          },
        }}
      >
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
            sx={{
              "& .MuiPickersDay-root": {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                borderRadius: "50%", // Circular day buttons
              },
              "& .MuiPickersDay-root.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
              "& .MuiDayCalendar-header": {
                "& .MuiTypography-root": {
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  fontWeight: 500,
                },
              },
              "& .MuiPickersCalendarHeader-label": {
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontWeight: 500,
                fontSize: "1rem",
              },
              "& .MuiPickersYear-yearButton": {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                borderRadius: "20px", // Pill-shaped year buttons
              },
              "& .MuiPickersYear-yearButton.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
              },
              "& .MuiPickersMonth-root": {
                fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                borderRadius: "20px", // Pill-shaped month buttons
              },
              "& .MuiPickersMonth-root.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
              },
            }}
          />
        </LocalizationProvider>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "space-between",
          padding: "16px 24px",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          onClick={handleToday}
          startIcon={<CalendarTodayRoundedIcon />}
          sx={{
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "0.875rem",
            color: theme.palette.primary.main,
            borderRadius: "20px", // Google Pay's pill-shaped buttons
            padding: "6px 16px",
          }}
        >
          {t("Today")}
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "0.875rem",
            borderRadius: "20px", // Google Pay's pill-shaped buttons
            padding: "6px 24px",
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
            },
          }}
        >
          {t("Apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatePickerDialog;
