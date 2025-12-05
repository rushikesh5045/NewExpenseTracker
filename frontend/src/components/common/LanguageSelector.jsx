import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Language, KeyboardArrowDown } from "@mui/icons-material";

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "mr", name: "मराठी" },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
    handleClose();
  };

  // Find current language name
  const currentLang =
    languages.find((lang) => lang.code === i18n.language)?.name || "English";

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClick}
        startIcon={<Language />}
        endIcon={<KeyboardArrowDown />}
        sx={{
          borderRadius: "100px",
          textTransform: "none",
        }}
      >
        {currentLang}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 3,
            mt: 1,
            minWidth: 180,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
            sx={{
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            }}
          >
            <ListItemText primary={lang.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
