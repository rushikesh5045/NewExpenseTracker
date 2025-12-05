// src/components/layout/Layout.jsx
import React from "react";
import { Box } from "@mui/material";
import BottomNav from "./BottomNav";

const Layout = ({ children }) => {
  return (
    <Box sx={{ pb: 8, width: "100%" }}>
      {children}
      <BottomNav />
    </Box>
  );
};

export default Layout;
