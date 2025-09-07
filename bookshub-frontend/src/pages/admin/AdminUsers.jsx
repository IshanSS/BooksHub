import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  Avatar,
  Paper,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5010/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setUsers([]);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5010/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {}
  };

  const handleRoleChange = async (id, newRole) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5010/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      setUsers(users.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    } catch (err) {}
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 4,
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          Manage Users
        </Typography>
        <Chip
          label={`${users.length} Users`}
          color="primary"
          variant="outlined"
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
        View, update roles, or remove users from the platform.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Users List */}
      <List disablePadding>
        {users.map((user) => (
          <ListItem
            key={user._id}
            alignItems="center"
            sx={{
              flexWrap: { xs: "wrap", sm: "nowrap" },
              p: 2,
              borderRadius: 2,
              mb: 1,
              bgcolor: "grey.50",
              "&:hover": { bgcolor: "grey.100" },
            }}
            secondaryAction={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  size="small"
                  sx={{
                    minWidth: 110,
                    bgcolor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "grey.300",
                    },
                  }}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(user._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <Avatar
              src={user.profilePic}
              alt={user.name}
              sx={{ width: 50, height: 50, mr: 2 }}
            >
              {user.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <ListItemText
              primary={
                <Typography fontWeight="bold" variant="body1">
                  {user.name}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AdminUsers;
