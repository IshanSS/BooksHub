import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Avatar,
} from "@mui/material";
import SellIcon from "@mui/icons-material/Sell";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5010/api/books/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data);
        }
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToWishlist = async () => {
    setWishlistLoading(true);
    setWishlistStatus("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5010/api/wishlist/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setWishlistStatus("Book added to wishlist!");
      } else {
        setWishlistStatus(data.message || "Failed to add to wishlist");
      }
    } catch (err) {
      setWishlistStatus("Network error");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!book) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography variant="h4">Book not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          mb: 5,
        }}
      >
        <Grid container spacing={4}>
          {/* Left: Book Image */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 3,
              }}
            >
              <CardMedia
                component="img"
                height="420"
                image={
                  book.imageUrl && book.imageUrl.startsWith("http")
                    ? book.imageUrl
                    : "https://via.placeholder.com/300x420?text=No+Image"
                }
                alt={book.bookName}
              />
            </Card>
          </Grid>

          {/* Right: Book Info */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {book.bookName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {book.author}
            </Typography>

            <Box
              sx={{ mt: 2, mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}
            >
              <Chip label={`Condition: ${book.condition}`} color="info" />
              <Chip label={`Edition: ${book.edition}`} color="default" />
              <Chip
                label={`${book.noOfPages} pages`}
                icon={<AutoStoriesIcon />}
              />
              <Chip
                label={book.isSold ? "Sold" : "Available"}
                color={book.isSold ? "error" : "success"}
              />
            </Box>

            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>

            {/* Price Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Price: ₹{book.price} ({book.priceType})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MRP: ₹{book.mrp}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? "Adding..." : "Add to Wishlist"}
            </Button>
            {wishlistStatus && (
              <Typography color="success.main" sx={{ mt: 1 }}>
                {wishlistStatus}
              </Typography>
            )}
            <Button variant="outlined" color="secondary">
              Purchase Now
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Extra Info Section */}
      <Grid container spacing={4}>
        {/* Tags */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Tags
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {book.tags && book.tags.length > 0 ? (
                book.tags.map((tag, i) => (
                  <Chip
                    key={i}
                    label={tag}
                    variant="outlined"
                    icon={<SellIcon />}
                  />
                ))
              ) : (
                <Typography color="text.secondary">No tags</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Owner Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Owner Information
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar>
                <AccountCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {book.owner?.name}
                </Typography>
                <Typography color="text.secondary">
                  {book.owner?.college}
                </Typography>
                <Typography color="text.secondary">
                  {book.owner?.location}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookDetails;
