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

function Home() {
  const [topRec, setTopRec] = useState(null);
  const [recLoading, setRecLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRec = async () => {
      setRecLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(
          "http://localhost:5010/api/auth/recommendations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.recommendations && data.recommendations.length > 0) {
            setTopRec(data.recommendations[0]);
          } else {
            setTopRec(null);
          }
        }
      } catch (err) {
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
            Welcome to PustakHub
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
      </Container>
    </Box>
  );
}

export default Home;
