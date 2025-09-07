import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Avatar,
  useTheme,
  Container,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const AdminStats = () => {
  const [stats, setStats] = useState({});
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5010/api/admin/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats({});
      }
    } catch (err) {
      setStats({});
    }
  };

  const cards = [
    {
      label: "Total Users",
      value: stats.userCount || 0,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: "Total Books",
      value: stats.bookCount || 0,
      icon: <MenuBookIcon />,
      color: theme.palette.secondary.main,
    },
    {
      label: "Total Reviews",
      value: stats.reviewCount || 0,
      icon: <RateReviewIcon />,
      color: theme.palette.info.main,
    },
    {
      label: "Books Sold",
      value: stats.soldBookCount || 0,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {cards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                transition: "0.3s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 8 },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: card.color,
                  width: 64,
                  height: 64,
                  mb: 2,
                }}
              >
                {card.icon}
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {card.value}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {card.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminStats;
