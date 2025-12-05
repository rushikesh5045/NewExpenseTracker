import React from "react";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  BarChart as StatisticsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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
        borderRadius: "24px 24px 0 0",
        overflow: "hidden",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      }}
      elevation={3}
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
        sx={{ height: 64 }}
      >
        <BottomNavigationAction
          label={t("Dashboard")}
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          label={t("Statistics")}
          icon={<StatisticsIcon />}
        />
        <BottomNavigationAction label={t("Settings")} icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
