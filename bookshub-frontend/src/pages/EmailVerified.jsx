import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

export default function EmailVerified() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    fetch(`http://localhost:5010/api/verify-email?token=${token}`)
      .then(async (res) => {
        const text = await res.text();
        if (res.ok) {
          setStatus("success");
          setMessage(text || "Email verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage(
            text || "Verification failed. The link may be invalid or expired."
          );
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. The link may be invalid or expired.");
      });
  }, [location.search]);

  const handleResend = async () => {
    setResendStatus("");
    if (!email) {
      setResendStatus("Please enter your email.");
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
        setResendStatus("Verification email resent. Please check your inbox.");
      } else {
        setResendStatus(data.message || "Failed to resend email.");
      }
    } catch {
      setResendStatus("Network error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        elevation={4}
        sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, textAlign: "center" }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Email Verification
        </Typography>
        {status === "verifying" ? (
          <Box mt={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              variant="body1"
              color={status === "success" ? "success.main" : "error"}
              sx={{ mb: 2 }}
            >
              {message}
            </Typography>
            <Box mt={3}>
              <Button variant="contained" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </Box>
            {status === "error" && (
              <Box mt={4}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Didn't get the email? Enter your email to resend verification:
                </Typography>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    width: "100%",
                    maxWidth: 320,
                  }}
                />
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={handleResend}
                >
                  Resend Verification Email
                </Button>
                {resendStatus && (
                  <Typography
                    color={
                      resendStatus.includes("resent") ? "success.main" : "error"
                    }
                    sx={{ mt: 1 }}
                  >
                    {resendStatus}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}
