import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CheckEmail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    const email = localStorage.getItem("pendingVerificationEmail");
    if (!email) {
      setError("No email found. Please sign up again.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:5010/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Verification email resent. Please check your inbox.");
      } else {
        setError(data.message || "Failed to resend verification email.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        elevation={4}
        sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, textAlign: "center" }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Check Your Email
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          We've sent a verification link to your email address. Please check
          your inbox and click the link to verify your account before logging
          in.
        </Typography>
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
          <Button variant="outlined" onClick={handleResend} disabled={loading}>
            {loading ? (
              <CircularProgress size={22} />
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
