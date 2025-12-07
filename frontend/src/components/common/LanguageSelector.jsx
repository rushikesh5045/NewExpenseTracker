import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Menu, MenuItem, ListItemText, Box } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

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
        onClick={handleClick}
        startIcon={<LanguageRoundedIcon />}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        sx={{
          borderRadius: "20px",
          textTransform: "none",
          fontFamily: '"Google Sans", "Roboto", sans-serif',
          fontWeight: 500,
          fontSize: "0.875rem",
          color: "text.primary",
          borderColor: "divider",
          padding: "8px 16px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
        }}
      >
        {currentLang}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 3,
            mt: 1,
            minWidth: 180,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.08)",
          },
        }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        {languages.map((lang) => {
          const isSelected = i18n.language === lang.code;

          return (
            <MenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              selected={isSelected}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                height: 48,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                fontSize: "0.875rem",
                fontWeight: isSelected ? 500 : 400,
                color: isSelected ? "primary.main" : "text.primary",
                "&.Mui-selected": {
                  backgroundColor: "rgba(26, 115, 232, 0.08)",
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemText
                primary={lang.name}
                primaryTypographyProps={{
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                }}
              />
              {isSelected && (
                <CheckRoundedIcon
                  fontSize="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default LanguageSelector;
