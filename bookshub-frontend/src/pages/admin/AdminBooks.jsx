import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Paper,
  Box,
  Avatar,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BookIcon from "@mui/icons-material/Book";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5010/api/admin/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      setBooks([]);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5010/api/admin/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((b) => b._id !== id));
    } catch (err) {}
  };

  return (
    <Paper
      elevation={4}
      sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, width: "100%" }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Manage Books
        </Typography>
        <Chip
          label={`${books.length} Books`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Books Grid */}
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book._id}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "0.2s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
              }}
            >
              {/* Book Image + Info */}
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar
                  variant="rounded"
                  src={book.imageUrl}
                  alt={book.bookName}
                  sx={{ width: 80, height: 100, bgcolor: "grey.200" }}
                >
                  <BookIcon />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold" noWrap>
                    {book.bookName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {book.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹{book.price} ({book.condition})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Edition: {book.edition}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subject: {book.subject}
                  </Typography>
                </Box>
              </Box>

              {/* Divider */}
              <Divider sx={{ my: 2 }} />

              {/* Owner Info */}
              <Box display="flex" alignItems="center" gap={1}>
                {book.owner?.profilePic ? (
                  <Avatar
                    src={book.owner.profilePic}
                    alt={book.owner.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {book.owner?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                )}
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {book.owner?.name || "Unknown"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {book.owner?.email || "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Tags */}
              <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                {book.tags && book.tags.length > 0 ? (
                  book.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  ))
                ) : (
                  <Chip label="No tags" size="small" variant="outlined" />
                )}
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, flexGrow: 1 }}
              >
                {book.description || "No description available."}
              </Typography>

              {/* Delete Button */}
              <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(book._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default AdminBooks;
