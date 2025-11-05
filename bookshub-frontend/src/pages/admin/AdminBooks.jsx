import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5010/api/admin/books", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this book for listing?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5010/api/admin/books/${id}/approve`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) =>
            b._id === id ? { ...b, isApproved: true, isRejected: false } : b
          )
        );
      }
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this book?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5010/api/admin/books/${id}/reject`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) =>
            b._id === id ? { ...b, isApproved: false, isRejected: true } : b
          )
        );
      }
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5010/api/admin/books/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <Box sx={{ width: "100%", py: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          bgcolor: "background.paper",
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
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

        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : books.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
            No books available.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={book._id}
                sx={{ display: "flex" }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
                    width: "100%",
                  }}
                >
                  {/* Book Image */}
                  <Box
                    sx={{
                      position: "relative",
                      bgcolor: "grey.100",
                      height: 300,
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/300x400?text=No+Image"
                      }
                      alt={book.bookName}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                      {book.isApproved ? (
                        <Chip label="Approved" color="success" size="small" />
                      ) : book.isRejected ? (
                        <Chip label="Rejected" color="error" size="small" />
                      ) : (
                        <Chip label="Pending" color="warning" size="small" />
                      )}
                    </Box>
                  </Box>

                  {/* Book Info */}
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {book.bookName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {book.author || "Unknown Author"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {book.description || "No description available."}
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {(book.tags || []).slice(0, 3).map((tag, i) => (
                        <Chip
                          key={i}
                          label={tag}
                          size="small"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Footer Actions */}
                  <Box
                    sx={{
                      borderTop: "1px solid #eee",
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: "grey.50",
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/admin/books/${book._id}`)}
                      sx={{ textTransform: "none" }}
                    >
                      View
                    </Button>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      {!book.isApproved && !book.isRejected && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            color="success"
                            onClick={() => handleApprove(book._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleReject(book._id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(book._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default AdminBooks;
