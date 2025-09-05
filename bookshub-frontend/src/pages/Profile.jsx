import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:5010/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          logout();
          navigate("/login");
        }
      } catch (err) {
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [logout, navigate]);

  useEffect(() => {
    const fetchWishlist = async () => {
      setWishlistLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5010/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWishlist(data);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setWishlistLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profile) return null;

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header Section */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 5,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 3,
          borderRadius: 4,
        }}
      >
        <Avatar
          sx={{ width: 100, height: 100 }}
          src={profile.profilePic || undefined}
          alt={profile.name}
        >
          {!profile.profilePic && profile.name
            ? profile.name[0].toUpperCase()
            : "U"}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold">
            {profile.name}
          </Typography>
          <Typography color="text.secondary">{profile.email}</Typography>
          <Typography color="text.secondary">{profile.college}</Typography>
          <Typography color="text.secondary">{profile.location}</Typography>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={logout}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          Logout
        </Button>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 4,
              transition: "all 0.3s ease",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {profile.postedBooks ? profile.postedBooks.length : 0}
            </Typography>
            <Typography color="text.secondary">Books Posted</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 4,
              transition: "all 0.3s ease",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {wishlistLoading ? "..." : wishlist.length}
            </Typography>
            <Typography color="text.secondary">Wishlist Items</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 4,
              transition: "all 0.3s ease",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              0
            </Typography>
            <Typography color="text.secondary">Chats</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Posted Books Section */}
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Posted Books
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {profile.postedBooks && profile.postedBooks.length > 0 ? (
          profile.postedBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book._id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 4,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "translateY(-6px)" },
                }}
              >
                <CardHeader
                  title={book.bookName}
                  subheader={book.author}
                  titleTypographyProps={{ fontWeight: "bold" }}
                />
                <CardContent>
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
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography color="text.secondary" sx={{ ml: 1 }}>
            No books posted yet.
          </Typography>
        )}
      </Grid>
    </Container>
  );
}
