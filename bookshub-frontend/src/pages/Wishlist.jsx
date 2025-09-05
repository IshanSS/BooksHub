import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";

function Wishlist() {
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5010/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistBooks(data);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId) => {
    setRemovingId(bookId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5010/api/wishlist/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setWishlistBooks((prev) => prev.filter((b) => b._id !== bookId));
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Wishlist
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Books you’ve saved for later.
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {wishlistBooks.length > 0 ? (
            wishlistBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id}>
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
                      variant="outlined"
                      color="error"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleRemove(book._id)}
                      disabled={removingId === book._id}
                    >
                      {removingId === book._id ? "Removing..." : "Remove"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: "center", width: "100%" }}>
              <Typography variant="body1" color="text.secondary">
                No books in wishlist yet.
              </Typography>
            </Box>
          )}
        </Grid>
      )}
    </Container>
  );
}

export default Wishlist;
