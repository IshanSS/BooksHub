import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Books", to: "/admin/books" },
  { label: "Reviews", to: "/admin/reviews" },
];

const AdminHeader = ({ onLogout }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          boxShadow: 2,
        }}
      >
        <Toolbar>
          {/* Logo & Title */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/admin/dashboard")}
          >
            <AdminPanelSettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              BooksHub Admin
            </Typography>
          </Stack>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{
                  color: "inherit",
                  borderRadius: 2,
                  fontWeight: pathname === link.to ? "bold" : "normal",
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
            <Button
              variant="outlined"
              color="inherit"
              onClick={onLogout}
              sx={{
                ml: 2,
                borderColor: "white",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            sx={{ display: { md: "none" } }}
            onClick={toggleDrawer}
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
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Admin Menu
          </Typography>
          <Divider />
          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                onClick={toggleDrawer}
                selected={pathname === link.to}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "rgba(0,0,0,0.08)",
                    fontWeight: "bold",
                  },
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItemButton
              onClick={() => {
                onLogout?.();
                toggleDrawer();
              }}
            >
              <ListItemText primary="Logout" sx={{ color: "error.main" }} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default AdminHeader;
