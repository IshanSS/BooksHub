import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Box,
  Chip,
  InputLabel,
  Select,
  FormControl,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
const priceTypes = ["Fixed", "Negotiable"];

export default function AddBook() {
  const [form, setForm] = useState({
    bookName: "",
    subject: "",
    price: "",
    condition: "",
    author: "",
    priceType: "",
    mrp: "",
    branch: "",
    noOfPages: "",
    edition: "",
    description: "",
    tags: [],
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    let value = e.target.value;
    if (typeof value === "string") {
      value = value.split(",");
    }
    setForm((prev) => ({ ...prev, tags: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags") {
          value.forEach((tag) => formData.append("tags", tag));
        } else {
          formData.append(key, value);
        }
      });
      if (image) formData.append("bookImage", image);
      const res = await fetch("http://localhost:5010/api/books", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        navigate("/profile");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to add book");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: "linear-gradient(180deg, #fff, #fafafa)",
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          textAlign="center"
        >
          Add New Book
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Fill in the details below to add your book to PustakHub.
        </Typography>

        {/* Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={3}>
            {/* Book Name */}
            <Grid item xs={12}>
              <TextField
                label="Book Name"
                name="bookName"
                value={form.bookName}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            {/* Subject & Author */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Author"
                name="author"
                value={form.author}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            {/* Branch & Edition */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Branch"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Edition"
                name="edition"
                value={form.edition}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            {/* Pages & MRP */}
            <Grid item xs={12} md={6}>
              <TextField
                label="No. of Pages"
                name="noOfPages"
                type="number"
                value={form.noOfPages}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="MRP"
                name="mrp"
                type="number"
                value={form.mrp}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            {/* Price & Condition */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  label="Condition"
                >
                  {conditions.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Price Type */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Price Type</InputLabel>
                <Select
                  name="priceType"
                  value={form.priceType}
                  onChange={handleChange}
                  label="Price Type"
                >
                  {priceTypes.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select
                  multiple
                  name="tags"
                  value={form.tags}
                  onChange={handleTagsChange}
                  input={<OutlinedInput label="Tags" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {[
                    "Engineering",
                    "Medical",
                    "Science",
                    "Maths",
                    "Fiction",
                    "Non-fiction",
                    "Exam",
                    "Reference",
                  ].map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 1.2, borderRadius: 2 }}
              >
                Upload Book Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {image && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontStyle: "italic", color: "text.secondary" }}
                >
                  Selected: {image.name}
                </Typography>
              )}
            </Grid>

            {/* Error Message */}
            {error && (
              <Grid item xs={12}>
                <Typography
                  color="error"
                  sx={{ fontWeight: 500, textAlign: "center" }}
                >
                  {error}
                </Typography>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Add Book"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
