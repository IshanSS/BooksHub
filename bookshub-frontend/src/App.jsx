// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddBook from "./pages/AddBook";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Auth wrapper
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";

export default function App() {
  return (
    <Routes>
      {/* Admin panel (no user NavBar/Footer) for all /admin/* routes */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* All other routes with user NavBar/Footer */}
      <Route
        path="*"
        element={
          <Box display="flex" flexDirection="column" minHeight="100vh">
            <NavBar />
            <Box component="main" flex={1}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/book/:id" element={<BookDetails />} />
                <Route
                  path="/wishlist"
                  element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <UserRoute>
                      <Profile />
                    </UserRoute>
                  }
                />
                <Route
                  path="/add-book"
                  element={
                    <PrivateRoute>
                      <AddBook />
                    </PrivateRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        }
      />
    </Routes>
  );
}
