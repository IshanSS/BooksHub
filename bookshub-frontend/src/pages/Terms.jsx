import React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";

export default function Terms() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Terms & Conditions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          By using BookHive, you agree to our terms and conditions. You are
          responsible for the content you post and for complying with all
          applicable laws. BookHive is not liable for transactions between
          users. For questions, contact support@bookhive.com.
        </Typography>
      </Paper>
    </Container>
  );
}
