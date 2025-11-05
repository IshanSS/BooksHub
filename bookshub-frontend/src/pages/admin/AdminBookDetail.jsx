import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

export default function AdminBookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // detect admin role from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.role === "admin");
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/books/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setBook(data);
      } catch (err) {
        console.error("Fetch book error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBook();
    return () => (mounted = false);
  }, [id]);

  const doAdminAction = async (action) => {
    if (!isAdmin) return alert("Unauthorized");
    if (
      !window.confirm(
        `${action === "approve" ? "Approve" : "Reject"} this book?`
      )
    )
      return;
    setBusy(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/api/admin/books/${id}/${action}`;
      const res = await fetch(url, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Action failed");
      }
      const data = await res.json();
      setBook(
        data.book || {
          ...book,
          isApproved: action === "approve",
          isRejected: action === "reject",
        }
      );
    } catch (err) {
      console.error("Admin action error:", err);
      alert(err.message || "Network error");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  if (!book)
    return (
      <Container sx={{ py: 6 }}>
        <Typography>Book not found</Typography>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button variant="text" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" gap={3} flexDirection={{ xs: "column", md: "row" }}>
          <Box sx={{ minWidth: 220 }}>
            <Box
              component="img"
              src={
                book.imageUrl ||
                "https://via.placeholder.com/320x420?text=No+Image"
              }
              alt={book.bookName}
              sx={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              {book.bookName}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              by {book.author || "Unknown"}
            </Typography>

            <Typography variant="body1" paragraph>
              {book.description || "No description available."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2">
              Price: रु{book.price ?? "-"}
            </Typography>
            <Typography variant="body2">
              Edition: {book.edition || "-"}
            </Typography>
            <Typography variant="body2">
              Condition: {book.condition || "-"}
            </Typography>

            <Box sx={{ mt: 3, display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/admin/books`)}
                disabled={busy}
              >
                Back to list
              </Button>

              {/* View detail does nothing here — this is the admin detail view */}

              {isAdmin && (
                <>
                  {!book.isApproved && !book.isRejected && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => doAdminAction("approve")}
                        disabled={busy}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => doAdminAction("reject")}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {book.isApproved && <Chip label="Approved" color="success" />}
                  {book.isRejected && <Chip label="Rejected" color="error" />}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
