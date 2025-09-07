import React, { useEffect, useState } from "react";
import { Paper, Typography, Grid } from "@mui/material";

const AdminStats = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/statistics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle1">Users</Typography>
          <Typography variant="h5">{stats.userCount || 0}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle1">Books</Typography>
          <Typography variant="h5">{stats.bookCount || 0}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle1">Reviews</Typography>
          <Typography variant="h5">{stats.reviewCount || 0}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle1">Sold Books</Typography>
          <Typography variant="h5">{stats.soldBookCount || 0}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdminStats;
