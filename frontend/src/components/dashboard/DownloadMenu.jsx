import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { exportData } from "../../services/api";

import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";

const DownloadMenu = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async (format) => {
    try {
      setLoading(true);
      const response = await exportData(format);

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expense-tracker-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleDownloadPdf = () => {
    handleDownload("pdf");
  };

  const handleDownloadCsv = () => {
    handleDownload("csv");
  };

  return (
    <>
      <Tooltip title={t("download")}>
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
            borderRadius: 3,
            mt: 1,
            minWidth: 200,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.08)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={handleDownloadPdf}
          disabled={loading}
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
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <PictureAsPdfRoundedIcon
                fontSize="small"
                sx={{ color: "#e94235" }}
              />
            )}
          </ListItemIcon>
          <ListItemText
            primary={t("download_pdf")}
            primaryTypographyProps={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontSize: "0.875rem",
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={handleDownloadCsv}
          disabled={loading}
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
              sx={{ color: "#1e8e3e" }}
            />
          </ListItemIcon>
          <ListItemText
            primary={t("download_csv")}
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
