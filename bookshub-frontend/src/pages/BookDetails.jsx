import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";
import KhaltiPaymentButton from "../components/KhaltiPaymentButton";
import SellIcon from "@mui/icons-material/Sell";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

const BookDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState("");
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Decode token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload._id);
        // detect admin role for showing approve/reject in details
        setIsAdmin(payload.role === "admin");
      } catch (e) {
        setUserId(null);
        setIsAdmin(false);
      }
    }
  }, []);

  // admin flag
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin approve/reject handlers (only reachable for admins)
  const handleAdminApprove = async () => {
    if (!window.confirm("Approve this book for public listing?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/books/${id}/approve`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBook((prev) =>
          prev ? { ...prev, isApproved: true, isRejected: false } : prev
        );
      } else {
        alert("Approve failed");
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Network error");
    }
  };

  const handleAdminReject = async () => {
    if (
      !window.confirm(
        "Reject this book? It will be hidden from public listings."
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/books/${id}/reject`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setBook((prev) =>
          prev ? { ...prev, isApproved: false, isRejected: true } : prev
        );
      } else {
        alert("Reject failed");
      }
    } catch (err) {
      console.error("Reject error:", err);
      alert("Network error");
    }
  };

  // Fetch book
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:5010/api/books/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data);
        }
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Check if book is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5010/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInWishlist(data.some((b) => b._id === id));
        }
      } catch {}
    };
    checkWishlist();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (!book) return;
    setReviewLoading(true);
    fetch(`http://localhost:5010/api/reviews/${book._id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data || []))
      .finally(() => setReviewLoading(false));
  }, [book]);

  // Fetch recommendations + fallback
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const base = process.env.REACT_APP_API_URL || "http://localhost:5010";
        // try recommendation endpoint
        const res = await fetch(
          `${base}/api/recommendations/book/${id}?limit=6`
        );
        if (res.ok) {
          const data = await res.json();
          const recs = data?.recommendations || data || [];
          const normalized = Array.isArray(recs)
            ? recs.map((r) => (r.book ? r.book : r))
            : [];
          if (mounted && normalized.length > 0) {
            setRelated(normalized.slice(0, 4));
            setRelatedLoading(false);
            return;
          }
        }
        // fallback: fetch recent books and select a few (exclude current)
        const allRes = await fetch(`${base}/api/books`);
        if (allRes.ok) {
          const all = await allRes.json();
          const candidates = (all || []).filter(
            (b) => String(b._id) !== String(id) && !b.isSold
          );
          // prefer same tags if available
          const tags = (
            book && Array.isArray(book.tags) ? book.tags : []
          ).slice(0, 3);
          let fallback = [];
          if (tags.length > 0) {
            const byTag = candidates.filter((c) =>
              (c.tags || []).some((t) => tags.includes(t))
            );
            fallback = byTag;
          }
          if (fallback.length === 0) fallback = candidates;
          if (mounted) setRelated(fallback.slice(0, 4));
        }
      } catch (e) {
        console.error("Related fetch error:", e);
        if (mounted) setRelated([]);
      } finally {
        if (mounted) setRelatedLoading(false);
      }
    };

    fetchRelated();
    return () => (mounted = false);
  }, [id, book]);

  // on mount / when location changes, check for payment query or pidx and verify via lookup if needed
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const payment = qs.get("payment");
    const thankyou = qs.get("thankyou");
    const pidx = qs.get("pidx"); // Khalti payment id

    // resilient lookup helper
    const performLookup = async (pidx) => {
      const endpoints = [
        `${API_URL}/api/payment/khalti/lookup`,
        `${API_URL}/api/payment/lookup`,
        `${API_URL}/api/payment/khalti/lookup/`,
      ];
      for (const url of endpoints) {
        try {
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pidx }),
          });
          if (resp.status === 404) continue;
          const data = await resp.json();
          return { status: resp.status, ok: resp.ok, data };
        } catch (e) {
          // try next
        }
      }
      throw new Error("Lookup failed");
    };

    // If pidx present and no 'payment' handled, perform server-side lookup to verify canonical status
    if (pidx && !payment) {
      (async () => {
        setPaymentNotice({ type: "info", text: "Verifying payment..." });
        try {
          const result = await performLookup(pidx);
          const lookup = result?.data;
          const st = lookup?.status || lookup?.data?.status || null;
          if (st === "Completed") {
            setPaymentNotice({
              type: "success",
              text: "Payment verified: Completed",
              thankyou: true,
            });
            // If we can determine product from purchase_order_id, try to refresh book
            try {
              const resBook = await fetch(
                `http://localhost:5010/api/books/${id}`
              );
              if (resBook.ok) {
                const b = await resBook.json();
                setBook(b);
              }
            } catch {}
            // cleanup URL and show success UI
            navigate(location.pathname, { replace: true });
          } else if (st === "Pending" || st === "Initiated") {
            setPaymentNotice({
              type: "warning",
              text: `Payment status: ${st}. Please wait or contact support.`,
            });
            navigate(location.pathname, { replace: true });
          } else {
            // other statuses (Expired, User canceled, Refunded, etc) treat as failure
            setPaymentNotice({
              type: "error",
              text: `Payment status: ${st || "unknown"}`,
            });
            navigate(location.pathname, { replace: true });
          }
        } catch (err) {
          console.error("Lookup error:", err);
          setPaymentNotice({
            type: "error",
            text: "Payment verification failed (network)",
          });
          navigate(location.pathname, { replace: true });
        }
      })();
      return;
    }

    if (payment) {
      if (payment === "success") {
        setPaymentNotice({
          type: "success",
          text: "Payment successful. The book has been marked as sold.",
          thankyou: thankyou === "true",
        });
        // refresh book to get updated sold state
        (async () => {
          try {
            const res = await fetch(`http://localhost:5010/api/books/${id}`);
            if (res.ok) {
              const b = await res.json();
              setBook(b);
            }
          } catch (err) {
            // ignore
          } finally {
            // remove query params from URL so notice doesn't persist on reload
            navigate(location.pathname, { replace: true });
          }
        })();
      } else {
        setPaymentNotice({
          type: "error",
          text: `Payment issue (${payment})`,
        });
        navigate(location.pathname, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, id]);

  const userReview = reviews.find((r) => r.user && r.user._id === userId);

  const handleAddToWishlist = async () => {
    setWishlistLoading(true);
    setWishlistStatus("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5010/api/wishlist/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setWishlistStatus("Book added to wishlist!");
        setInWishlist(true);
      } else {
        setWishlistStatus(data.message || "Failed to add to wishlist");
      }
    } catch {
      setWishlistStatus("Network error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5010/api/reviews/${book._id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [...prev, data]);
        setRating(0);
        setComment("");
      } else {
        const data = await res.json();
        setReviewError(data.message || "Failed to submit review");
      }
    } catch {
      setReviewError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5010/api/reviews/${book._id}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    }
  };

  const handlePaymentSuccess = (updatedBook) => {
    if (updatedBook) {
      setBook(updatedBook);
    } else {
      setBook((prev) => (prev ? { ...prev, isSold: true } : prev));
    }
  };

  // Loading / not found states
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!book) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" align="center">
          Book not found
        </Typography>
      </Container>
    );
  }

  // Responsive layout: left column narrower on large screens, stacks on small
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Grid container spacing={4} alignItems="flex-start">
        {/* Left: Image + Action Card */}
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
            <CardMedia
              component="img"
              sx={{ height: { xs: 220, sm: 320, md: 420 }, objectFit: "cover" }}
              image={
                book.imageUrl && book.imageUrl.startsWith("http")
                  ? book.imageUrl
                  : "https://via.placeholder.com/400x560?text=No+Image"
              }
              alt={book.bookName || "Book image"}
            />
          </Card>

          <Paper elevation={3} sx={{ mt: 3, p: 2, borderRadius: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Price
              </Typography>
              {/* Price section: use Nepali rupee symbol */}
              <Typography variant="h5" fontWeight="bold" sx={{ lineHeight: 1 }}>
                रु{book.price ?? "-"}{" "}
                <Typography component="span" variant="body2">
                  ({book.priceType ?? "-"})
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                MRP: रु{book.mrp ?? "-"}
              </Typography>
            </Box>

            <Box
              display="flex"
              gap={2}
              flexDirection={{ xs: "column", sm: "row" }}
              sx={{ mt: 2 }}
            >
              <Button
                variant={inWishlist ? "outlined" : "contained"}
                color={inWishlist ? "success" : "primary"}
                onClick={handleAddToWishlist}
                disabled={wishlistLoading || inWishlist}
                fullWidth
              >
                {inWishlist
                  ? "Added to Wishlist"
                  : wishlistLoading
                  ? "Adding..."
                  : "Add to Wishlist"}
              </Button>

              <Box sx={{ width: "100%" }}>
                <KhaltiPaymentButton
                  amount={book.price}
                  productName={book.bookName}
                  productId={book._id}
                  productSold={!!book.isSold}
                  onSuccess={handlePaymentSuccess}
                />
              </Box>
            </Box>

            {wishlistStatus && (
              <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
                {wishlistStatus}
              </Typography>
            )}
            {book.isSold && (
              <Typography
                color="error"
                variant="subtitle2"
                fontWeight="bold"
                sx={{ mt: 1 }}
              >
                This book is sold
              </Typography>
            )}

            {paymentNotice && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  color={
                    paymentNotice.type === "success" ? "success.main" : "error"
                  }
                  variant="body2"
                  fontWeight="bold"
                >
                  {paymentNotice.text}
                </Typography>
                {paymentNotice.thankyou && (
                  <Typography color="text.primary">
                    Thank you for your payment.
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right: Details, Reviews, Tags */}
        <Grid item xs={12} sm={12} md={8}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {book.bookName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} sx={{ my: 1 }}>
              <Rating
                value={book.averageRating || 0}
                precision={0.1}
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                {book.numReviews ?? 0} review{book.numReviews > 1 ? "s" : ""}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {book.description || "No description available."}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom>
                  Reviews
                </Typography>

                {reviewLoading ? (
                  <CircularProgress size={24} />
                ) : reviews.length === 0 ? (
                  <Typography color="text.secondary">
                    No reviews yet.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {reviews.map((r) => (
                      <Paper key={r._id} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" gap={2} alignItems="center">
                          <Avatar>
                            {r.user?.name?.[0]?.toUpperCase() || "U"}
                          </Avatar>
                          <Box flex={1}>
                            <Typography fontWeight={700}>
                              {r.user?.name || "User"}
                            </Typography>
                            <Rating value={r.rating} readOnly size="small" />
                          </Box>
                          {userId && r.user && r.user._id === userId && (
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteReview(r._id)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, fontStyle: "italic" }}
                        >
                          "{r.comment}"
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}

                {/* Add Review */}
                {userId && !userReview && (
                  <Box
                    component="form"
                    onSubmit={handleReviewSubmit}
                    sx={{ mt: 3 }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Add your review
                    </Typography>
                    <Rating
                      value={rating}
                      onChange={(_, val) => setRating(val)}
                      size="large"
                    />
                    <Box mt={2} />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Write your review..."
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                      required
                    />
                    {reviewError && (
                      <Typography color="error" sx={{ mt: 1 }}>
                        {reviewError}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ mt: 2 }}
                      disabled={submitting || rating === 0}
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </Box>
                )}

                {userId && userReview && (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    You have already reviewed this book.
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {(book.tags || []).length > 0 ? (
                    book.tags.map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag}
                        icon={<SellIcon />}
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">No tags</Typography>
                  )}
                </Box>

                <Paper sx={{ mt: 3, p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Seller Information
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      <AccountCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>
                        {book.owner?.name || "-"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {book.owner?.college || "-"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {book.owner?.location || "-"}
                      </Typography>
                    </Box>
                  </Box>
                  {isAdmin && (
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      {!book.isApproved && !book.isRejected && (
                        <>
                          <Button
                            variant="contained"
                            onClick={handleAdminApprove}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleAdminReject}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {book.isApproved && (
                        <Chip label="Approved" color="success" />
                      )}
                      {book.isRejected && (
                        <Chip label="Rejected" color="error" />
                      )}
                    </Box>
                  )}
                </Paper>

                {/* Related picks */}
                <Paper sx={{ mt: 3, p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Related picks
                  </Typography>
                  {relatedLoading ? (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : related.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No suggestions available.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {related.map((r) => (
                        <Box
                          key={r._id}
                          display="flex"
                          gap={1}
                          alignItems="center"
                        >
                          <img
                            src={
                              r.imageUrl || "https://via.placeholder.com/60x80"
                            }
                            alt={r.bookName || "Related"}
                            style={{
                              width: 60,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              noWrap
                              sx={{ maxWidth: 160 }}
                            >
                              {r.bookName}
                            </Typography>
                            {/* Related picks price */}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              रु{r.price ?? "-"}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookDetails;
