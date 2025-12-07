import React from "react";
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

const BottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return 0;
    if (path.startsWith("/statistics")) return 1;
    if (path.startsWith("/settings")) return 2;
    return 0;
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: "20px 20px 0 0",
        overflow: "hidden",
        boxShadow: "0 -1px 5px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: theme.palette.divider,
        borderBottom: 0,
      }}
      elevation={0}
    >
      <BottomNavigation
        showLabels
        value={getCurrentValue()}
        onChange={(event, newValue) => {
          switch (newValue) {
            case 0:
              navigate("/dashboard");
              break;
            case 1:
              navigate("/statistics");
              break;
            case 2:
              navigate("/settings");
              break;
            default:
              navigate("/dashboard");
          }
        }}
        sx={{
          height: 68,
          backgroundColor: theme.palette.background.paper,
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            maxWidth: 168,
            padding: "8px 0 6px",
            color: theme.palette.text.secondary,
            "&.Mui-selected": {
              color: theme.palette.primary.main,
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontSize: "0.75rem",
            fontWeight: 500,
            transition: "font-size 0.2s, opacity 0.2s",
            opacity: 0.9,
            "&.Mui-selected": {
              fontSize: "0.75rem",
            },
          },
        }}
      >
        <BottomNavigationAction
          label={t("home")}
          icon={
            <Box
              sx={{
                height: 28,
                width: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor:
                  getCurrentValue() === 0
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                transition: "background-color 0.2s",
              }}
            >
              <HomeRoundedIcon
                sx={{
                  fontSize: "1.25rem",
                  color:
                    getCurrentValue() === 0
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                }}
              />
            </Box>
          }
        />
        <BottomNavigationAction
          label={t("analytics")}
          icon={
            <Box
              sx={{
                height: 28,
                width: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor:
                  getCurrentValue() === 1
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                transition: "background-color 0.2s",
              }}
            >
              <InsightsRoundedIcon
                sx={{
                  fontSize: "1.25rem",
                  color:
                    getCurrentValue() === 1
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                }}
              />
            </Box>
          }
        />
        <BottomNavigationAction
          label={t("settings")}
          icon={
            <Box
              sx={{
                height: 28,
                width: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor:
                  getCurrentValue() === 2
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                transition: "background-color 0.2s",
              }}
            >
              <SettingsRoundedIcon
                sx={{
                  fontSize: "1.25rem",
                  color:
                    getCurrentValue() === 2
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                }}
              />
            </Box>
          }
        />
      </BottomNavigation>
    </Paper>
  );
};

// Helper function to create alpha colors
const alpha = (color, opacity) => {
  if (typeof color === "string" && color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default BottomNav;
