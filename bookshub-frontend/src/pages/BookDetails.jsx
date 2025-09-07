import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
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
  IconButton,
} from "@mui/material";
import SellIcon from "@mui/icons-material/Sell";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import DeleteIcon from "@mui/icons-material/Delete";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  // Decode token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload._id);
      } catch (e) {
        setUserId(null);
      }
    }
  }, []);

  // Fetch book
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

  // Fetch reviews
  useEffect(() => {
    if (!book) return;
    setReviewLoading(true);
    fetch(`http://localhost:5010/api/reviews/${book._id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .finally(() => setReviewLoading(false));
  }, [book]);

  const userReview = reviews.find((r) => r.user && r.user._id === userId);

  const handleAddToWishlist = async () => {
    setWishlistLoading(true);
    setWishlistStatus("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5010/api/wishlist/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setWishlistStatus("Book added to wishlist!");
      } else {
        setWishlistStatus(data.message || "Failed to add to wishlist");
      }
    } catch {
      setWishlistStatus("Network error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5010/api/reviews/${book._id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [...prev, data]);
        setRating(0);
        setComment("");
      } else {
        const data = await res.json();
        setReviewError(data.message || "Failed to submit review");
      }
    } catch {
      setReviewError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5010/api/reviews/${book._id}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
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
      <Grid container spacing={4}>
        {/* Left Image (sticky on desktop) */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 3,
              position: { md: "sticky" },
              top: 24,
            }}
          >
            <CardMedia
              component="img"
              height="500"
              image={
                book.imageUrl && book.imageUrl.startsWith("http")
                  ? book.imageUrl
                  : "https://via.placeholder.com/300x420?text=No+Image"
              }
              alt={book.bookName}
            />
          </Card>
        </Grid>

        {/* Right Details */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight="bold">
            {book.bookName}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>

          {/* Rating */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            {typeof book.averageRating === "number" && (
              <Rating value={book.averageRating} precision={0.1} readOnly />
            )}
            {book.numReviews > 0 && (
              <Typography color="text.secondary">
                ({book.numReviews} review{book.numReviews > 1 ? "s" : ""})
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Book Info */}
          <Typography variant="h6" gutterBottom>
            Book Information
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip label={`Condition: ${book.condition}`} color="info" />
            <Chip label={`Edition: ${book.edition}`} />
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

          {/* Price */}
          <Typography variant="h6" color="primary" fontWeight="bold">
            Price: ₹{book.price} ({book.priceType})
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            MRP: ₹{book.mrp}
          </Typography>

          <Box mt={2} mb={3}>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? "Adding..." : "Add to Wishlist"}
            </Button>
            <Button variant="outlined" color="secondary">
              Purchase Now
            </Button>
            {wishlistStatus && (
              <Typography color="success.main" sx={{ mt: 1 }}>
                {wishlistStatus}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Reviews */}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Reviews
          </Typography>
          {reviewLoading ? (
            <CircularProgress />
          ) : reviews.length === 0 ? (
            <Typography color="text.secondary">No reviews yet.</Typography>
          ) : (
            reviews.map((r) => (
              <Card key={r._id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar>{r.user?.name?.[0]?.toUpperCase() || "U"}</Avatar>
                  <Box flex={1}>
                    <Typography fontWeight="bold">
                      {r.user?.name || "User"}
                    </Typography>
                    <Rating value={r.rating} readOnly size="small" />
                  </Box>
                  {userId && r.user && r.user._id === userId && (
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteReview(r._id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  "{r.comment}"
                </Typography>
              </Card>
            ))
          )}

          {/* Add Review */}
          {userId && !userReview && (
            <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add Your Review
              </Typography>
              <Rating
                value={rating}
                onChange={(_, val) => setRating(val)}
                size="large"
                required
              />
              <Box mt={2} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Write your review..."
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontFamily: "inherit",
                }}
                required
              />
              {reviewError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {reviewError}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={submitting || rating === 0}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </Box>
          )}
          {userId && userReview && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              You have already reviewed this book.
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Tags & Owner */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Owner Information
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar>
                    <AccountCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold">
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookDetails;
