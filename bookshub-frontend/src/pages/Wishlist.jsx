import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";

const wishlistBooks = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    img: "https://picsum.photos/200/300?10",
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    img: "https://picsum.photos/200/300?11",
  },
];

export default function Wishlist() {
  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        My Wishlist
      </Typography>
      <Grid container spacing={3}>
        {wishlistBooks.map((book) => (
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
                <Button variant="outlined" color="error" sx={{ mt: 2 }}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
