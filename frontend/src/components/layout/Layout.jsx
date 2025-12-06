import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import BottomNav from "./BottomNav";

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        pb: { xs: 10, sm: 9 }, // Extra padding to account for bottom nav
        width: "100%",
        maxWidth: "100%",
        minHeight: "100vh",
        backgroundColor:
          theme.palette.mode === "light"
            ? theme.palette.background.default
            : theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main content area with Google Pay styling */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          px: { xs: 0, sm: 2 },
          // Content max-width like Google Pay
          "& > *": {
            maxWidth: { sm: "600px", md: "800px" },
            mx: { sm: "auto" },
            width: "100%",
          },
          // Safe area for iOS devices
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
      </Box>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Safe area spacer for iOS devices */}
      <Box
        sx={{
          height: "env(safe-area-inset-bottom)",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 1001,
        }}
      />
    </Box>
  );
};

export default Layout;
