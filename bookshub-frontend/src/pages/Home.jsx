import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
} from "@mui/material";
import bgImage from "../assets/background.jpg";

function Home() {
  const [topRec, setTopRec] = useState(null);
  const [recLoading, setRecLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]); // NEW: all recommendations
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // not logged in — don't attempt fetch, show message instead
      setIsLoggedIn(false);
      setRecommendations([]);
      setTopRec(null);
      setRecLoading(false);
      return;
    }
    setIsLoggedIn(true);

    const fetchRec = async () => {
      setRecLoading(true);
      try {
        // Try both endpoints for compatibility
        let res = await fetch(
          "http://localhost:5010/api/books/recommendations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          // fallback for old endpoint
          res = await fetch("http://localhost:5010/api/auth/recommendations", {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (res.ok) {
          const data = await res.json();
          // Accept both {recommendations: [...]} and [...] as response
          const recs = Array.isArray(data) ? data : data.recommendations || [];
          setRecommendations(recs);
          setTopRec(recs[0] || null);
        } else {
          setRecommendations([]);
          setTopRec(null);
        }
      } catch (err) {
        setRecommendations([]);
        setTopRec(null);
      }
      setRecLoading(false);
    };

    fetchRec();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 6, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
          >
            Welcome to BooksHub
          </Typography>
          <Typography
            variant="h6"
            sx={{ mt: 2, mb: 4, fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            Discover, save, and connect with readers around the world.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: "bold" }}
            onClick={() => navigate("/browse")}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Top Recommendation */}
      <Container sx={{ py: { xs: 5, md: 8 } }}>
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          textAlign="center"
        >
          Your Top Book Recommendation
        </Typography>

        {recLoading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : !isLoggedIn ? (
          <Box textAlign="center" sx={{ py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Please log in to see personalized recommendations.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Login
            </Button>
          </Box>
        ) : topRec ? (
          <Grid container justifyContent="center" spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={8} md={6} lg={4}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="280"
                  image={
                    topRec.imageUrl ||
                    "https://via.placeholder.com/400x600?text=No+Image"
                  }
                  alt={topRec.bookName}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    noWrap
                  >
                    {topRec.bookName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {topRec.author}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {topRec.subject}
                  </Typography>
                  {topRec.tags && topRec.tags.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Tags: {topRec.tags.join(", ")}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/book/${topRec._id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 3 }}>
            No recommendations found. Add books or wishlist to get personalized
            suggestions!
          </Typography>
        )}

        {/* All Recommendations */}
        {recommendations.length > 1 && (
          <>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ mt: 6, mb: 2, textAlign: "center" }}
            >
              More Recommendations For You
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {recommendations.slice(1).map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        book.imageUrl ||
                        "https://via.placeholder.com/400x600?text=No+Image"
                      }
                      alt={book.bookName}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        noWrap
                      >
                        {book.subject}
                      </Typography>
                      {book.tags && book.tags.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Tags: {book.tags.join(", ")}
                        </Typography>
                      )}
                      <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/book/${book._id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Home;
