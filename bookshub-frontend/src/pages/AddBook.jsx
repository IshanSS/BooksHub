import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
const priceTypes = ["Fixed", "Negotiable"];
const tagOptions = [
  "Engineering",
  "Medical",
  "Science",
  "Maths",
  "Fiction",
  "Non-fiction",
  "Exam",
  "Reference",
];

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

  const handleTagClick = (tag) => {
    setForm((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate pages count
    const pages = parseInt(form.noOfPages, 10);
    if (!isNaN(pages) && pages > 2000) {
      setError("Page no should be less than 2000");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags")
          value.forEach((tag) => formData.append("tags", tag));
        else formData.append(key, value);
      });
      if (image) formData.append("bookImage", image);

      const res = await fetch("http://localhost:5010/api/books", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) navigate("/profile");
      else {
        const data = await res.json();
        setError(data.message || "Failed to add book");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          backdropFilter: "blur(8px)",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          sx={{ mb: 1 }}
        >
          Add a New Book
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Enter details below to list your book on <b>BookHub</b>.
        </Typography>

        {/* Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={3}>
            {/* Left Section */}
            <Grid item xs={12} md={7}>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Book Name"
                  name="bookName"
                  value={form.bookName}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Author"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Branch"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  label="Edition"
                  name="edition"
                  value={form.edition}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <TextField
                  label="No. of Pages"
                  name="noOfPages"
                  type="number"
                  value={form.noOfPages}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ min: 1, max: 2000 }}
                />

                <TextField
                  label="MRP"
                  name="mrp"
                  type="number"
                  value={form.mrp}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Box>
            </Grid>

            {/* Right Section */}
            <Grid item xs={12} md={5}>
              {/* Condition */}
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 1, mt: { xs: 2, md: 0 } }}
              >
                Condition
              </Typography>
              <ToggleButtonGroup
                value={form.condition}
                exclusive
                fullWidth
                onChange={(e, val) =>
                  setForm({ ...form, condition: val || "" })
                }
                sx={{
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButton-root": {
                    borderRadius: 3,
                    border: "1px solid #ccc",
                    textTransform: "none",
                    fontWeight: 500,
                    flex: "1 1 45%",
                  },
                }}
              >
                {conditions.map((c) => (
                  <ToggleButton key={c} value={c}>
                    {c}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* Price Type */}
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mt: 3, mb: 1 }}
              >
                Price Type
              </Typography>
              <ToggleButtonGroup
                value={form.priceType}
                exclusive
                fullWidth
                onChange={(e, val) =>
                  setForm({ ...form, priceType: val || "" })
                }
                sx={{
                  "& .MuiToggleButton-root": {
                    borderRadius: 3,
                    textTransform: "none",
                    flex: 1,
                    fontWeight: 500,
                  },
                }}
              >
                {priceTypes.map((p) => (
                  <ToggleButton key={p} value={p}>
                    {p}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* Image Upload */}
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    py: 1.2,
                    borderRadius: 3,
                    borderColor: "#ccc",
                    fontWeight: 600,
                  }}
                  startIcon={<AddPhotoAlternateIcon />}
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
                  <Box
                    mt={2}
                    sx={{
                      textAlign: "center",
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid #eee",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", py: 1 }}
                    >
                      {image.name}
                    </Typography>
                  </Box>
                )}
              </Box>
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
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Tags
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {tagOptions.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    clickable
                    color={form.tags.includes(tag) ? "primary" : "default"}
                    variant={form.tags.includes(tag) ? "filled" : "outlined"}
                    onClick={() => handleTagClick(tag)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Error Message */}
            {error && (
              <Grid item xs={12}>
                <Typography
                  color="error"
                  sx={{ textAlign: "center", fontWeight: 500 }}
                >
                  {error}
                </Typography>
              </Grid>
            )}

            {/* Submit */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1rem",
                  mt: 2,
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
