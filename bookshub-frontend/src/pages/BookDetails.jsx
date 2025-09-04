import React from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
} from "@mui/material";

// 🔑 Ideally move this to src/data/books.js and import in both Browse & BookDetails
const allBooks = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    img: "https://picsum.photos/200/300?4",
  },
  {
    id: 2,
    title: "Deep Work",
    author: "Cal Newport",
    img: "https://picsum.photos/200/300?5",
  },
  {
    id: 3,
    title: "Ikigai",
    author: "Héctor García",
    img: "https://picsum.photos/200/300?6",
  },
  {
    id: 4,
    title: "The Alchemist",
    author: "Paulo Coelho",
    img: "https://picsum.photos/200/300?7",
  },
];

const similarBooks = [
  {
    id: 2,
    title: "Deep Work",
    author: "Cal Newport",
    img: "https://picsum.photos/200/300?8",
  },
  {
    id: 3,
    title: "Ikigai",
    author: "Héctor García",
    img: "https://picsum.photos/200/300?9",
  },
];

export default function BookDetails() {
  const { id } = useParams();
  const book = allBooks.find((b) => b.id.toString() === id);

  if (!book) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography variant="h4">Book not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 5 }}>
      <Grid container spacing={4}>
        {/* Left: Book Image */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={book.img}
              alt={book.title}
            />
          </Card>
        </Grid>

        {/* Right: Book Info */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            {book.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>
          <Typography paragraph>
            This is a placeholder description for <b>{book.title}</b>. You can
            extend this with more details (publisher, year, summary, etc.).
          </Typography>
          <Button variant="contained" color="primary" sx={{ mr: 2 }}>
            Add to Wishlist
          </Button>
          <Button variant="outlined" color="secondary">
            Start Chat
          </Button>
        </Grid>
      </Grid>

      {/* Similar Books */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Similar Books
        </Typography>
        <Grid container spacing={3}>
          {similarBooks.map((sBook) => (
            <Grid item xs={12} sm={6} md={4} key={sBook.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={sBook.img}
                  alt={sBook.title}
                />
                <CardContent>
                  <Typography variant="h6">{sBook.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sBook.author}
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
