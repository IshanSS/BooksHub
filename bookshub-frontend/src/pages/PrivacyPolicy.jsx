import React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          We value your privacy. BookHive does not share your personal
          information with third parties except as required to provide our
          services or by law. We use your data only to improve your experience
          on our platform. For any questions, contact us at
          support@bookhive.com.
        </Typography>
      </Paper>
    </Container>
  );
}
