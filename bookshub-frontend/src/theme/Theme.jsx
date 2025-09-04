// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000ff",
      light: "#63a4ff",
      dark: "#004c8c",
      contrastText: "#fff",
    },
    secondary: { main: "#F59E0B" },
    background: { default: "#f7f8fa", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#4b5563" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700, fontSize: "2.25rem" },
    h2: { fontWeight: 700, fontSize: "1.875rem" },
    h3: { fontWeight: 600, fontSize: "1.5rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;
