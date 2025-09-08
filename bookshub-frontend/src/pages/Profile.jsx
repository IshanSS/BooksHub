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
  TextField,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [postedBooks, setPostedBooks] = useState([]);
  const [postedBooksLoading, setPostedBooksLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile
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

  // Fetch posted books
  useEffect(() => {
    const fetchPostedBooks = async () => {
      setPostedBooksLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5010/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPostedBooks(data.postedBooks || []);
        }
      } catch (err) {}
      setPostedBooksLoading(false);
    };
    fetchPostedBooks();
  }, [location]);

  // Fetch wishlist
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
      } catch (err) {}
      setWishlistLoading(false);
    };
    fetchWishlist();
  }, []);

  if (loading || postedBooksLoading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profile) return null;

  // Handlers
  const handleEditClick = () => {
    setEditName(profile.name || "");
    setEditCollege(profile.college || "");
    setEditLocation(profile.location || "");
    setEditProfilePic(null);
    setEditMode(true);
    setEditError("");
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("college", editCollege);
      formData.append("location", editLocation);
      if (editProfilePic) {
        formData.append("profilePic", editProfilePic);
      }
      const res = await fetch("http://localhost:5010/api/auth/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditMode(false);
      } else {
        const data = await res.json();
        setEditError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setEditError("Network error");
    }
    setEditLoading(false);
  };

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* Profile Header */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 5,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 3,
          borderRadius: 4,
        }}
      >
        <Avatar
          sx={{
            width: 110,
            height: 110,
            border: "3px solid",
            borderColor: "primary.main",
          }}
          src={profile.profilePic || undefined}
          alt={profile.name}
        >
          {!profile.profilePic && profile.name
            ? profile.name[0].toUpperCase()
            : "U"}
        </Avatar>

        <Box flex={1} width="100%">
          {editMode ? (
            <form onSubmit={handleEditSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="College"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" component="label" fullWidth>
                    Upload Picture
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setEditProfilePic(e.target.files[0])}
                    />
                  </Button>
                </Grid>
                {editError && (
                  <Grid item xs={12}>
                    <Typography color="error">{editError}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <CircularProgress size={22} />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button variant="outlined" onClick={handleEditCancel}>
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          ) : (
            <>
              <Typography variant="h5" fontWeight="bold">
                {profile.name}
              </Typography>
              <Typography color="text.secondary">{profile.email}</Typography>
              <Typography color="text.secondary">{profile.college}</Typography>
              <Typography color="text.secondary">{profile.location}</Typography>
            </>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/add-book")}
          >
            Add Book
          </Button>
          {!editMode && (
            <Button variant="outlined" onClick={handleEditClick}>
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 4,
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <LibraryBooksIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{postedBooks.length}</Typography>
            <Typography color="text.secondary">Books Posted</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 4,
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <FavoriteIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">
              {wishlistLoading ? "..." : wishlist.length}
            </Typography>
            <Typography color="text.secondary">Wishlist Items</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Posted Books */}
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Posted Books
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {postedBooks && postedBooks.length > 0 ? (
          postedBooks.map((book) => (
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
                {book.imageUrl && (
                  <Box
                    component="img"
                    src={book.imageUrl}
                    alt={book.bookName}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }}
                  />
                )}
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
