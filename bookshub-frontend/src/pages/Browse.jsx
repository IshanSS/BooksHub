import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Box,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

// Use the same sizing constants as admin
const CARD_HEIGHT = 380;
const IMAGE_HEIGHT = 240;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

export default function Browse() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`${API_URL}/api/books`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const booksData = await res.json();
        setBooks(booksData || []);
      } catch (err) {
        console.error("Error fetching books:", err);
        setFetchError({
          message: `Could not reach backend at ${API_URL}. Is the server running?`,
          hint: `Start your backend on ${API_URL} and click Retry.`,
        });
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filtered = books
    .filter((b) => b && b.isApproved === true)
    .filter(
      (book) =>
        (book.bookName || "").toLowerCase().includes(query.toLowerCase()) ||
        (book.author || "").toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(book.tags) &&
          book.tags.join(" ").toLowerCase().includes(query.toLowerCase()))
    );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Browse Books
      </Typography>

      {fetchError ? (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error" sx={{ mb: 1 }}>
            {fetchError.message}
          </Alert>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 1 }}
          >
            {fetchError.hint}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              // simple retry
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </Box>
      ) : null}

      <Box sx={{ mb: 4 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by title, author or tag"
        />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((book) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={book._id}
              sx={{ display: "flex", alignItems: "stretch" }}
            >
              <Paper
                onClick={() => navigate(`/book/${book._id}`)}
                elevation={2}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: 6 },
                  height: CARD_HEIGHT, // uniform card height
                  boxSizing: "border-box",
                  flexShrink: 0,
                }}
              >
                {/* Image cover (fixed height) */}
                <Box
                  sx={{
                    position: "relative",
                    height: IMAGE_HEIGHT,
                    bgcolor: "grey.100",
                  }}
                >
                  <Box
                    component="img"
                    src={
                      book.imageUrl ||
                      "https://via.placeholder.com/800x1200?text=No+Image"
                    }
                    alt={book.bookName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* Gradient overlay at bottom for readability */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      p: 2,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
                      color: "common.white",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      noWrap
                      sx={{ textOverflow: "ellipsis" }}
                    >
                      {book.bookName}
                    </Typography>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ opacity: 0.95, textOverflow: "ellipsis" }}
                    >
                      {book.author || "Unknown"}
                    </Typography>
                  </Box>
                </Box>

                {/* Footer area: main action is View */}
                <Box
                  sx={{
                    px: 2,
                    py: 2,
                    mt: "auto",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book/${book._id}`);
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    View
                  </Button>

                  <Box sx={{ flex: 1 }} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
