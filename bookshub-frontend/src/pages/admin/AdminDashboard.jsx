// src/pages/admin/AdminDashboard.jsx
import React from "react";
import { Box, useTheme } from "@mui/material";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/AdminFooter";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers";
import AdminBooks from "./AdminBooks";
import AdminReviews from "./AdminReviews";

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Admin logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="grey.50"
    >
      <AdminHeader onLogout={handleLogout} />
      <Box component="main" flex={1} sx={{ p: { xs: 2, md: 4 } }}>
        <Routes>
          <Route path="dashboard" element={<AdminStats />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="reviews" element={<AdminReviews />} />
          {/* Default: redirect /admin or /admin/ to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Box>
      <AdminFooter />
    </Box>
  );
};

export default AdminDashboard;
