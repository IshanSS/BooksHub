import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";

const featuredBooks = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    img: "https://picsum.photos/200/300?1",
  },
  {
    id: 2,
    title: "Deep Work",
    author: "Cal Newport",
    img: "https://picsum.photos/200/300?2",
  },
  {
    id: 3,
    title: "Ikigai",
    author: "Héctor García",
    img: "https://picsum.photos/200/300?3",
  },
];

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 6,
          textAlign: "center",
        }}
      >
        <Container>
          <Typography variant="h2" fontWeight="bold">
            Welcome to PustakHub
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
            Discover, save, and connect with readers around the world
          </Typography>
          <Button variant="contained" color="secondary" size="large">
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Featured Books */}
      <Container sx={{ py: 5 }}>
        <Typography variant="h4" gutterBottom>
          Featured Books
        </Typography>
        <Grid container spacing={3}>
          {featuredBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={book.img}
                  alt={book.title}
                />
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
      </Container>
    </Box>
  );
}
