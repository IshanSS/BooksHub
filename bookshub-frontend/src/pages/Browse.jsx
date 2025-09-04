import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom"; // ✅ import router link

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

export default function Browse() {
  const [query, setQuery] = useState("");

  const filtered = allBooks.filter((book) =>
    book.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Browse Books
      </Typography>

      {/* ✅ fixed: onChange */}
      <TextField
        label="Search books"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Grid container spacing={3}>
        {filtered.map((book) => (
          <Grid item xs={12} sm={6} md={3} key={book.id}>
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

                {/* ✅ Added: Link to BookDetails */}
                <Button
                  component={RouterLink}
                  to={`/book/${book.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
