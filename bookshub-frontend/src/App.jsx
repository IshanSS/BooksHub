import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

// Importing pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";

const Page = ({ title }) => (
  <Container sx={{ py: 5 }}>
    <Typography variant="h3" gutterBottom>
      {title}
    </Typography>
    <Typography>Content for {title} page goes here.</Typography>
  </Container>
);

export default function App() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar />
      <Box component="main" flex={1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}
