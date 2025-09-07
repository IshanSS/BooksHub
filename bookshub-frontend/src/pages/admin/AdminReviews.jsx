// src/pages/admin/AdminReviews.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RateReviewIcon from "@mui/icons-material/RateReview";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5010/api/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      setReviews([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5010/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {}
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">
        Reviews Management
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review._id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  boxShadow: 1,
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      {review.user?.name?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                  }
                  action={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(review._id)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  title={review.user?.name || "Unknown User"}
                  subheader={review.book ? `Book: ${review.book.title}` : ""}
                />
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <RateReviewIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {review.comment || "No comment provided"}
                    </Typography>
                  </Box>
                  {review.rating && (
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                    >
                      Rating: {review.rating} / 5
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminReviews;
