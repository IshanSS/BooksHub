import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [location, setLocation] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("college", college);
      formData.append("location", location);
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }
      formData.append("role", role);
      const res = await fetch("http://localhost:5010/api/auth/register", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("pendingVerificationEmail", email); // Store for resend
        navigate("/check-email"); // show check email page after signup
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="College"
          fullWidth
          value={college}
          onChange={(e) => setCollege(e.target.value)}
        />
        <TextField
          label="Location"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button variant="contained" component="label" sx={{ mb: 1 }}>
          Upload Profile Picture
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setProfilePic(e.target.files[0])}
          />
        </Button>
        <FormControl fullWidth>
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        {profilePic && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Selected: {profilePic.name}
          </Typography>
        )}
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" onClick={handleSubmit}>
          Sign Up
        </Button>
        <Typography variant="body2">
          Already have an account? <RouterLink to="/login">Login</RouterLink>
        </Typography>
      </Box>
    </Container>
  );
}
