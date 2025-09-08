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
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../assets/logo.png";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Browse", to: "/browse" },
  { label: "Wishlist", to: "/wishlist", protected: true },
  { label: "Chat", to: "/chat", protected: true },
  { label: "About Us", to: "/about" },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Top NavBar */}
      <AppBar
        position="sticky"
        color="primary"
        elevation={3}
        sx={{ px: { xs: 2, md: 5 } }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo + Brand */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Box
              component="img"
              src={Logo}
              alt="BookHive Logo"
              sx={{ height: 40, width: "auto" }}
            />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ letterSpacing: 1 }}
            >
              BOOK HIVE
            </Typography>
          </Stack>

          {/* Desktop Navigation */}
          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{
                  mx: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  color: "white",
                  backgroundColor:
                    pathname === link.to
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {link.label}
              </Button>
            ))}

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
                  sx={{
                    mx: 1,
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "white",
                      color: "primary.main",
                    },
                  }}
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
            sx={{ display: { md: "none" } }}
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
        sx={{ "& .MuiDrawer-paper": { width: 240 } }}
      >
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box
              component="img"
              src={Logo}
              alt="BookHive Logo"
              sx={{ height: 35, width: "auto" }}
            />
            <Typography variant="h6" fontWeight="bold">
              BOOK HIVE
            </Typography>
          </Stack>
          <Divider />

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
