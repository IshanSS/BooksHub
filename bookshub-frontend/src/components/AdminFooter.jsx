import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const AdminFooter = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: "center",
        bgcolor: theme.palette.secondary.main,
        color:
          theme.palette.secondary.contrastText || theme.palette.common.white,
        mt: 4,
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} BooksHub Admin. All rights reserved.
      </Typography>
    </Box>
  );
};

export default AdminFooter;
