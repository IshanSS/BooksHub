import React from "react";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

const recentBooks = [
  { id: 1, title: "Deep Work", author: "Cal Newport" },
  { id: 2, title: "Ikigai", author: "Héctor García" },
];

export default function Profile() {
  return (
    <Container sx={{ py: 5 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar sx={{ width: 80, height: 80, mr: 3 }}>U</Avatar>
        <Box>
          <Typography variant="h5">test user</Typography>
          <Typography color="text.secondary">test@example.com</Typography>
        </Box>
      </Box>

      <Button variant="contained" color="primary" sx={{ mr: 2 }}>
        Edit Profile
      </Button>
      <Button variant="outlined" color="secondary">
        Logout
      </Button>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Recently Viewed
        </Typography>
        <Grid container spacing={3}>
          {recentBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {book.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
