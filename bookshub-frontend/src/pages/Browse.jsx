import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Browse() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:5010/api/books");
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filtered = books.filter((book) =>
    book.bookName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Browse Books
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search and explore books posted by students.
      </Typography>

      {/* Search Bar */}
      <TextField
        label="Search books"
        variant="outlined"
        fullWidth
        sx={{ mb: 4 }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Loader */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filtered.length > 0 ? (
            filtered.map((book) => (
              <Grid item xs={12} sm={6} md={3} key={book._id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={
                      book.imageUrl && book.imageUrl.startsWith("http")
                        ? book.imageUrl
                        : "https://via.placeholder.com/300x400?text=No+Image"
                    }
                    alt={book.bookName}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      noWrap
                    >
                      {book.bookName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      noWrap
                    >
                      {book.author}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/book/${book._id}`}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography color="text.secondary" sx={{ mx: 2 }}>
              No books found.
            </Typography>
          )}
        </Grid>
      )}
    </Container>
  );
}
