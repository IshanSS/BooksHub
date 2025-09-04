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
import { Link as RouterLink, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Browse", to: "/browse" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Chat", to: "/chat" },
  { label: "Profile", to: "/profile" },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  return (
    <>
      <AppBar position="sticky" color="primary" elevation={3}>
        <Toolbar>
          {/* Logo */}
          <Stack direction="row" alignItems="center" sx={{ flexGrow: 1 }}>
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
          </List>
        </Box>
      </Drawer>
    </>
  );
}
