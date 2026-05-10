import { createTheme } from "@mui/material/styles";
import { COLORS, RADIUS, SHADOWS } from "./designTokens";

const theme = createTheme({
  typography: {
    fontFamily: '"Times New Roman", Times, serif',
    h1: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h2: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h3: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h4: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h5: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    h6: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 700 },
    button: { fontFamily: '"Times New Roman", Times, serif' },
  },
  palette: {
    background: { default: COLORS.background, paper: "#ffffff" },
    text: { primary: COLORS.foreground },
    primary: { main: COLORS.secondaryAccent, contrastText: "#ffffff" },
    secondary: { main: COLORS.accent, contrastText: "#ffffff" },
    divider: COLORS.muted,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.background,
          backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.wobbly,
          border: `3px solid ${COLORS.border}`,
          boxShadow: SHADOWS.standard,
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: "1rem",
          color: COLORS.foreground,
          backgroundColor: "#ffffff",
          textTransform: "none",
          minHeight: 44,
          transition: "transform 100ms, box-shadow 100ms, background-color 100ms",
          "&:hover": {
            backgroundColor: COLORS.accent,
            color: "#ffffff",
            boxShadow: SHADOWS.hover,
            transform: "translate(2px, 2px)",
            border: `3px solid ${COLORS.border}`,
          },
          "&:active": {
            boxShadow: "none",
            transform: "translate(4px, 4px)",
          },
          "&.Mui-disabled": {
            opacity: 0.45,
            border: `3px solid ${COLORS.muted}`,
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: COLORS.secondaryAccent,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: COLORS.accent,
            color: "#ffffff",
          },
        },
        containedSecondary: {
          backgroundColor: COLORS.accent,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#e03030",
            color: "#ffffff",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: RADIUS.wobblyMd,
            fontFamily: '"Times New Roman", Times, serif',
            backgroundColor: "#ffffff",
            "& fieldset": {
              borderColor: COLORS.border,
              borderWidth: 2,
            },
            "&:hover fieldset": { borderColor: COLORS.border },
            "&.Mui-focused fieldset": {
              borderColor: COLORS.secondaryAccent,
              borderWidth: 2,
              boxShadow: `0 0 0 3px ${COLORS.secondaryAccent}33`,
            },
          },
          "& input::placeholder, & textarea::placeholder": {
            color: "rgba(45,45,45,0.4)",
            fontFamily: '"Times New Roman", Times, serif',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.wobblyMd,
          border: `2px solid ${COLORS.border}`,
          boxShadow: SHADOWS.card,
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.wobblyMd,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: RADIUS.wobblyMd,
          border: `2px solid ${COLORS.border}`,
          boxShadow: SHADOWS.emphasized,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.wobbly,
          fontFamily: '"Times New Roman", Times, serif',
          border: `2px solid ${COLORS.border}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.wobblyMd,
          border: `2px solid`,
          fontFamily: '"Times New Roman", Times, serif',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: '"Times New Roman", Times, serif',
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;
