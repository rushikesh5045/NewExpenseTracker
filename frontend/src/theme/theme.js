import { createTheme } from "@mui/material/styles";

// Material You color system with subtle avatar colors
export const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#006495", // Primary color
        light: "#5092c3",
        dark: "#003a6a",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#9c27b0", // Secondary color
        light: "#d05ce3",
        dark: "#6a0080",
        contrastText: "#ffffff",
      },
      error: {
        main: "#b3261e", // Error color
        light: "#f2b8b5",
        dark: "#8c1d18",
      },
      success: {
        main: "#4CAF50", // Success color for income
        light: "#80e27e",
        dark: "#087f23",
      },
      background: {
        default: "#f8f9fa",
        paper: "#ffffff",
      },
      text: {
        primary: "#1c1b1f",
        secondary: "#49454f",
        disabled: "#79747e",
      },
      // Subtle avatar colors palette
      avatar: {
        income: "#e6f4ea", // Light green background
        incomeText: "#1e8e3e", // Dark green text
        expense: "#fce8e6", // Light red background
        expenseText: "#c5221f", // Dark red text
        salary: "#e8f0fe", // Light blue background
        salaryText: "#1a73e8", // Blue text
        food: "#fef7e0", // Light yellow background
        foodText: "#e37400", // Orange text
        transport: "#e6f4ea", // Light green background
        transportText: "#1e8e3e", // Dark green text
        default: "#f1f3f4", // Light gray background
        defaultText: "#5f6368", // Dark gray text
      },
    },
    shape: {
      borderRadius: 4, // Reduced border radius as requested
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: "2.5rem",
        fontWeight: 400,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 400,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 400,
        lineHeight: 1.2,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 400,
        lineHeight: 1.2,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.2,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
      button: {
        textTransform: "none", // Material You uses sentence case for buttons
        fontWeight: 500,
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.4,
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.4,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Reduced border radius
            padding: "10px 24px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
          },
          contained: {
            "&:hover": {
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
          },
          outlined: {
            borderWidth: "1px",
          },
        },
        defaultProps: {
          disableElevation: true, // Material You uses less elevation by default
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 4, // Reduced border radius
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 4, // Reduced border radius
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 4, // Reduced border radius
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 4, // Reduced border radius
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64, // Taller bottom navigation
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            padding: "8px 0",
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
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 600, // Bolder text in avatars
            fontSize: "0.9rem", // Slightly smaller font size
            letterSpacing: "0.5px", // Better letter spacing
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 500,
            minHeight: 48,
            borderRadius: 4, // Reduced border radius
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
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          rectangular: {
            borderRadius: 4, // Reduced border radius
          },
          text: {
            borderRadius: 4, // Reduced border radius
            transform: "scale(1)",
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            borderRadius: 48, // Keep FAB circular
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4, // Reduced border radius
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 4, // Reduced border radius
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 4, // Reduced border radius
          },
        },
      },
    },
  });
};

const theme = createAppTheme(localStorage.getItem("theme") || "light");

export default theme;
