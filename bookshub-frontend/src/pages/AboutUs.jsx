import React from "react";
import { Container, Typography, Box, Paper, Avatar, Grid } from "@mui/material";
import logo from "../assets/logo.png";

const team = [
  {
    name: "",
    role: "Founder & Developer",
    image: logo, // Replace with actual team member images if available
    bio: "Passionate about books, technology, and building communities.",
  },
  {
    name: "",
    role: "Co-Founder & Designer",
    image: logo, // Replace with actual image if available
    bio: "Loves UI/UX, design, and making things beautiful and usable.",
  },
];

export default function AboutUs() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          <Avatar
            src={logo}
            alt="BooksHub Logo"
            sx={{ width: 64, height: 64 }}
          />
          <Typography variant="h4" fontWeight="bold">
            About BookHive
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          BookHive is a platform dedicated to connecting book lovers, buyers,
          and sellers. Our mission is to make it easy for students and readers
          to find, buy, and sell books, and to foster a vibrant reading
          community.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Whether you are looking for your next great read, want to sell your
          old textbooks, or simply connect with fellow readers, BooksHub is here
          for you. We believe in the power of knowledge and the joy of sharing
          books.
        </Typography>
      </Paper>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Meet the Team
      </Typography>
      <Grid container spacing={3}>
        {team.map((member, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper
              elevation={2}
              sx={{ p: 3, borderRadius: 3, textAlign: "center" }}
            >
              <Avatar
                src={member.image}
                alt={member.name}
                sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
              />
              <Typography variant="h6" fontWeight="bold">
                {member.name}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {member.role}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {member.bio}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
