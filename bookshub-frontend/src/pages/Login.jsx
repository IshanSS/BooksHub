import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    console.log("handleSubmit called");
    setError("");
    const result = await login(email, password);
    console.log("login result:", result);
    if (result.success) {
      console.log("Navigating to /profile");
      navigate("/profile");
    } else {
      setError(result.message || "Login failed");
      console.log("Login failed:", result.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" onClick={handleSubmit}>
          Login
        </Button>
        <Typography variant="body2">
          Don’t have an account? <RouterLink to="/signup">Sign up</RouterLink>
        </Typography>
      </Box>
    </Container>
  );
}
