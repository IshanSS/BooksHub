// src/components/Footer.jsx
import React from "react";
import {
  Box,
  Typography,
  Link as MuiLink,
  IconButton,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
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
          BOOK HIVE
        </Typography>

        <Box>
          <MuiLink
            component={RouterLink}
            to="/privacy-policy"
            color="inherit"
            sx={{ mx: 1 }}
          >
            Privacy Policy
          </MuiLink>
          <MuiLink
            component={RouterLink}
            to="/terms"
            color="inherit"
            sx={{ mx: 1 }}
          >
            Terms
          </MuiLink>
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
