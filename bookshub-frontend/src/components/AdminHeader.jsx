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
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // use central auth (call unconditionally)

const navLinks = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Books", to: "/admin/books" },
  { label: "Books Sold", to: "/admin/books-sold" },
  { label: "Reviews", to: "/admin/reviews" },
];

const AdminHeader = ({ onLogout: onLogoutProp }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // read auth from context so header updates when auth changes
  const auth = useAuth(); // always call hook
  const user = auth?.user ?? null;
  const logoutFn = auth?.logout ?? null;

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const doLogout = () => {
    // prefer auth.logout if available, else fallback
    try {
      if (logoutFn) logoutFn();
      else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (e) {
      // ignore
    }
    // call optional prop
    if (typeof onLogoutProp === "function") onLogoutProp();
    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: (theme) => theme.palette.secondary.main,
          color: (theme) => theme.palette.secondary.contrastText,
          boxShadow: 2,
        }}
      >
        <Toolbar>
          {/* Logo & Title */}
          <Box
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/admin/dashboard")}
          >
            <AdminPanelSettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              BookHub Admin
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {/* show admin nav only when logged-in admin */}
            {user && user.role === "admin" ? (
              <>
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

                {/* Logout */}
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={doLogout}
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
              </>
            ) : (
              // if not admin/logged-out, show link to login
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                sx={{ borderRadius: 2 }}
              >
                Login
              </Button>
            )}
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
            {user && user.role === "admin" ? (
              <>
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
                    doLogout();
                  }}
                >
                  <ListItemText primary="Logout" sx={{ color: "error.main" }} />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton
                  component={RouterLink}
                  to="/login"
                  onClick={toggleDrawer}
                  selected={pathname === "/login"}
                >
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/signup"
                  onClick={toggleDrawer}
                  selected={pathname === "/signup"}
                >
                  <ListItemText primary="Sign up" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default AdminHeader;
