import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.filter((u) => u._id !== id));
  };

  const handleRoleChange = async (id, newRole) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers(users.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
  };

  return (
    <div>
      <Typography variant="h6">Users</Typography>
      <List>
        {users.map((user) => (
          <ListItem
            key={user._id}
            secondaryAction={
              <>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(user._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={user.name} secondary={user.email} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default AdminUsers;
