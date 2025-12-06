import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Use rounded Material Icons for Google Pay style
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded"; // Better icon for CSV

const DownloadMenu = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadPdf = () => {
    // Implement PDF download
    console.log("Download PDF");
    handleClose();
  };

  const handleDownloadCsv = () => {
    // Implement CSV download
    console.log("Download CSV");
    handleClose();
  };

  return (
    <>
      <Tooltip title={t("Download")}>
        <IconButton
          onClick={handleClick}
          aria-label="download options"
          aria-controls={open ? "download-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            color: "text.secondary",
            backgroundColor: "transparent",
            borderRadius: "50%",
            padding: "8px",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <FileDownloadRoundedIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id="download-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "download-button",
          dense: true,
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 3, // More rounded corners for Google Pay style
            mt: 1,
            minWidth: 200,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)", // Google Pay's shadow style
            border: "1px solid rgba(0,0,0,0.08)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={handleDownloadPdf}
          sx={{
            borderRadius: 1,
            mx: 1,
            my: 0.5,
            height: 48,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <ListItemIcon>
            <PictureAsPdfRoundedIcon
              fontSize="small"
              sx={{ color: "#e94235" }} // Google red for PDF icon
            />
          </ListItemIcon>
          <ListItemText
            primary={t("Download PDF")}
            primaryTypographyProps={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontSize: "0.875rem",
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={handleDownloadCsv}
          sx={{
            borderRadius: 1,
            mx: 1,
            my: 0.5,
            height: 48,
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <ListItemIcon>
            <GridOnRoundedIcon
              fontSize="small"
              sx={{ color: "#1e8e3e" }} // Google green for CSV icon
            />
          </ListItemIcon>
          <ListItemText
            primary={t("Download CSV")}
            primaryTypographyProps={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontSize: "0.875rem",
            }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default DownloadMenu;
