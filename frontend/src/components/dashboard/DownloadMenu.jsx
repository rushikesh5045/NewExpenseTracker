import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

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
      <IconButton
        color="primary"
        onClick={handleClick}
        aria-label="download options"
        aria-controls={open ? "download-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <FileDownloadIcon />
      </IconButton>

      <Menu
        id="download-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "download-button",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 1,
            mt: 1,
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={handleDownloadPdf}
          sx={{ borderRadius: 1, mx: 1, my: 0.5 }}
        >
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Download PDF")}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleDownloadCsv}
          sx={{ borderRadius: 1, mx: 1, my: 0.5 }}
        >
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Download CSV")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default DownloadMenu;
