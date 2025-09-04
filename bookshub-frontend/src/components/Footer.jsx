// src/components/Footer.jsx
import React from "react";
import { Box, Typography, Link, IconButton, Stack } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ py: 3, px: 2, mt: "auto", bgcolor: "primary.main", color: "white" }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6" fontWeight="bold">
          PustakHub
        </Typography>

        <Box>
          <Link href="#" color="inherit" sx={{ mx: 1 }}>
            Privacy Policy
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 1 }}>
            Terms
          </Link>
        </Box>

        <Box>
          <IconButton color="inherit">
            <FacebookIcon />
          </IconButton>
          <IconButton color="inherit">
            <TwitterIcon />
          </IconButton>
          <IconButton color="inherit">
            <LinkedInIcon />
          </IconButton>
        </Box>
      </Stack>

      <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
        © {new Date().getFullYear()} PustakHub. All rights reserved.
      </Typography>
    </Box>
  );
}
