// src/components/common/DeleteConfirmDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pt: 3,
          px: 3,
          pb: 1,
        }}
      >
        <WarningRoundedIcon
          sx={{
            color: theme.palette.error.main,
            fontSize: 28,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            fontSize: "1.125rem",
          }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Typography
          sx={{
            fontFamily: '"Google Sans Text", "Roboto", sans-serif',
            color: theme.palette.text.secondary,
            fontSize: "0.9375rem",
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={onClose}
          disabled={isDeleting}
          color="inherit"
          sx={{
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            borderRadius: 20,
            px: 3,
            color:
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.6)"
                : "rgba(255,255,255,0.7)",
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          disableElevation
          sx={{
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontWeight: 500,
            borderRadius: 20,
            px: 3,
            py: 1,
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
            },
          }}
          startIcon={
            isDeleting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isDeleting ? t("deleting") : t("delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
