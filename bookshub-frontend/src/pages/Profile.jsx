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
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  if (loading) {
    return (
      <Container sx={{ py: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profile) return null;

  return (
    <Container sx={{ py: 5 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar
          sx={{ width: 80, height: 80, mr: 3 }}
          src={
            profile.profilePic && profile.profilePic !== ""
              ? profile.profilePic
              : undefined
          }
          alt={profile.name}
        >
          {!profile.profilePic || profile.profilePic === ""
            ? profile.name
              ? profile.name[0].toUpperCase()
              : "U"
            : null}
        </Avatar>
        <Box>
          <Typography variant="h5">{profile.name}</Typography>
          <Typography color="text.secondary">{profile.email}</Typography>
          <Typography color="text.secondary">{profile.college}</Typography>
          <Typography color="text.secondary">{profile.location}</Typography>
        </Box>
      </Box>

      <Button variant="outlined" color="secondary" onClick={logout}>
        Logout
      </Button>

      {/* Example: Show posted books if needed */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Posted Books
        </Typography>
        <Grid container spacing={3}>
          {profile.postedBooks && profile.postedBooks.length > 0 ? (
            profile.postedBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{book.bookName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {book.author}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No books posted yet.</Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
