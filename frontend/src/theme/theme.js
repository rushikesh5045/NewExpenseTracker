import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode) => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#1a73e8",
        light: "#4285f4",
        dark: "#0d47a1",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#202124",
        light: "#5f6368",
        dark: "#000000",
        contrastText: "#ffffff",
      },
      error: {
        main: "#d93025",
        light: "#f28b82",
        dark: "#b31412",
      },
      warning: {
        main: "#f29900",
        light: "#fdd663",
        dark: "#e37400",
      },
      info: {
        main: "#1a73e8",
        light: "#4285f4",
        dark: "#0d47a1",
      },
      success: {
        main: "#1e8e3e",
        light: "#34a853",
        dark: "#137333",
      },
      background: {
        default: isDark ? "#202124" : "#f8f9fa",
        paper: isDark ? "#303134" : "#ffffff",
        subtle: isDark ? "#28292c" : "#f1f3f4",
      },
      text: {
        primary: isDark ? "#e8eaed" : "#202124",
        secondary: isDark ? "#9aa0a6" : "#5f6368",
        disabled: isDark ? "#80868b" : "#80868b",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      gpay: {
        blue: "#1a73e8",
        green: "#1e8e3e",
        yellow: "#f9ab00",
        red: "#d93025",
        teal: "#129eaf",
        purple: "#9334e6",
        // Transaction type colors
        income: "#1e8e3e",
        expense: "#d93025",
        transfer: "#1a73e8",
        // Background colors for category icons
        iconBg: {
          blue: "rgba(26, 115, 232, 0.08)",
          green: "rgba(30, 142, 62, 0.08)",
          yellow: "rgba(249, 171, 0, 0.08)",
          red: "rgba(217, 48, 37, 0.08)",
          teal: "rgba(18, 158, 175, 0.08)",
          purple: "rgba(147, 52, 230, 0.08)",
        },
      },
    },
    typography: {
      fontFamily: '"Google Sans Text", "Roboto", "Arial", sans-serif',
      h1: {
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        fontSize: "2rem",
        fontWeight: 400,
        letterSpacing: "-0.0125em",
      },
      h2: {
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        fontSize: "1.75rem",
        fontWeight: 400,
        letterSpacing: "-0.0083em",
      },
      h3: {
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        fontSize: "1.5rem",
        fontWeight: 400,
        letterSpacing: "0em",
      },
      h4: {
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        fontSize: "1.25rem",
        fontWeight: 500,
        letterSpacing: "0.0025em",
      },
      h5: {
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        fontSize: "1.125rem",
        fontWeight: 500,
        letterSpacing: "0em",
      },
      h6: {
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        fontSize: "1rem",
        fontWeight: 500,
        letterSpacing: "0.0015em",
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 500,
        letterSpacing: "0.0015em",
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
        letterSpacing: "0.001em",
      },
      body1: {
        fontSize: "1rem",
        letterSpacing: "0.00938em",
      },
      body2: {
        fontSize: "0.875rem",
        letterSpacing: "0.0142em",
      },
      button: {
        textTransform: "none",
        fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
        fontWeight: 500,
        letterSpacing: "0.0107em",
      },
      caption: {
        fontSize: "0.75rem",
        letterSpacing: "0.04em",
      },
      overline: {
        fontSize: "0.625rem",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: "0 24px",
            height: 40,
            fontWeight: 500,
            fontSize: "0.875rem",
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
            },
          },
          outlined: {
            borderWidth: "1px",
          },
          text: {
            padding: "0 16px",
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "none",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
          },
          elevation1: {
            boxShadow: "none",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            backgroundColor: (theme) => theme.palette.background.paper,
            color: (theme) => theme.palette.text.primary,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          },
        },
        defaultProps: {
          elevation: 0,
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
            backgroundColor: (theme) => theme.palette.background.paper,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            padding: "8px 0",
            minWidth: 80,
            color: (theme) => theme.palette.text.secondary,
            "&.Mui-selected": {
              color: (theme) => theme.palette.primary.main,
            },
          },
          label: {
            fontSize: "0.75rem",
            "&.Mui-selected": {
              fontSize: "0.75rem",
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: "0 2px 4px 0 rgba(0,0,0,0.2)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            height: 32,
            fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
            fontWeight: 500,
          },
          colorDefault: {
            backgroundColor: (theme) =>
              theme.palette.mode === "light" ? "#e0e0e0" : "#5f6368",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
            fontWeight: 500,
            fontSize: "0.875rem",
            minHeight: 48,
            padding: "0 16px",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: "1.25rem",
            fontWeight: 500,
            fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: (theme) => theme.palette.divider,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
            fontWeight: 500,
            color: (theme) => theme.palette.text.secondary,
            "&.Mui-selected": {
              color: (theme) => theme.palette.primary.main,
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? "rgba(26, 115, 232, 0.08)"
                  : "rgba(138, 180, 248, 0.08)",
            },
          },
        },
      },
    },
  });
};

export default createAppTheme;
