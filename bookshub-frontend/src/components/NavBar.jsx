// src/components/NavBar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ import auth

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Browse", to: "/browse" },
  { label: "Wishlist", to: "/wishlist", protected: true },
  { label: "Chat", to: "/chat", protected: true },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth(); // ✅ auth state

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to home after logout
  };

  return (
    <>
      <AppBar position="sticky" color="primary" elevation={3}>
        <Toolbar>
          {/* Logo */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <MenuBookIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              PustakHub
            </Typography>
          </Stack>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                color="inherit"
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor:
                    pathname === link.to
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                {link.label}
              </Button>
            ))}

            {/* Auth Buttons */}
            {!user ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="outlined"
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Signup
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/profile"
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Profile
                </Button>
                <Button onClick={handleLogout} color="inherit" sx={{ mx: 1 }}>
                  Logout
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={toggleDrawer}
            sx={{ display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer}
        sx={{ "& .MuiDrawer-paper": { width: 220 } }}
      >
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            PustakHub
          </Typography>
          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                onClick={toggleDrawer}
                selected={pathname === link.to}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}

            {!user ? (
              <>
                <ListItemButton
                  component={RouterLink}
                  to="/login"
                  onClick={toggleDrawer}
                >
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/signup"
                  onClick={toggleDrawer}
                >
                  <ListItemText primary="Signup" />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton
                  component={RouterLink}
                  to="/profile"
                  onClick={toggleDrawer}
                >
                  <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    handleLogout();
                    toggleDrawer();
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
