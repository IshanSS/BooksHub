import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PasswordField from "../../components/PasswordField";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LaunchIcon from "@mui/icons-material/Launch";
import DescriptionIcon from "@mui/icons-material/Description";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

/*
  Admin Payments (professional)
  - Paginated transactions via GET /api/payment/transactions
  - Inline admin login when unauthorized
  - Search/filter, Refresh, Export CSV
  - Responsive table on desktop, card list on mobile
  - Details dialog with book image, user info and raw meta
*/

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // auth/login state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // pagination & search
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  // verify/loading per-payment
  const [verifying, setVerifying] = useState(null);

  // details dialog
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // helper to get headers with token
  const headersWithToken = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // load paginated transactions from server (admin-only endpoint)
  const loadTransactions = async (p = page) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // include search q as simple filter on server-side? server supports filters; we'll pass q as nothing special
      const url = new URL(`${API_URL}/api/payment/transactions`);
      url.searchParams.set("page", p);
      url.searchParams.set("limit", limit);
      if (q) url.searchParams.set("q", q);
      const res = await fetch(url.toString(), { headers });
      if (res.status === 401 || res.status === 403) {
        setErrorMsg(
          "Unauthorized. Please log in as an admin to view transactions."
        );
        setPayments([]);
        setPages(1);
        setTotal(0);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setPayments(data.payments || []);
        setPage(data.page || 1);
        setPages(data.pages || 1);
        setTotal(data.total || (data.payments || []).length);
      } else {
        setErrorMsg("Failed to load transactions.");
        setPayments([]);
      }
    } catch (err) {
      console.error("Load transactions error:", err);
      setErrorMsg("Failed to load transactions (network).");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // admin inline login
  const handleAdminLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }
      const token = data.token || data.accessToken || data?.data?.token;
      const user = data.user || data?.data?.user;
      if (!token) {
        setLoginError("Login response missing token");
        return;
      }
      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      setAdminEmail("");
      setAdminPassword("");
      // reload
      await loadTransactions(1);
    } catch (err) {
      console.error("Admin login error:", err);
      setLoginError("Network error during login");
    } finally {
      setLoginLoading(false);
    }
  };

  // resilient lookup helper: try a list of endpoints until one succeeds
  const performLookup = async (pidx, headers = {}) => {
    const endpoints = [
      `${API_URL}/api/payment/khalti/lookup`,
      `${API_URL}/api/payment/lookup`,
      `${API_URL}/api/payment/khalti/lookup/`,
    ];
    let lastErr = null;
    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(headers || {}) },
          body: JSON.stringify({ pidx }),
        });
        // if 404 try next endpoint
        if (resp.status === 404) {
          lastErr = new Error(`Not found: ${url}`);
          continue;
        }
        // non-2xx will still return json error which caller can handle
        const data = await resp.json();
        return { status: resp.status, ok: resp.ok, data, resp };
      } catch (err) {
        lastErr = err;
        // try next
      }
    }
    throw lastErr || new Error("Lookup failed");
  };

  const handleVerify = async (p) => {
    if (!p?.pidx) {
      alert("No pidx available for this payment.");
      return;
    }
    setVerifying(p._id);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const result = await performLookup(p.pidx, headers);
      if (!result) throw new Error("Lookup failed");
      // if server returned non-OK, but JSON exists, handle its status
      const lookup = result.data;
      if (result.status === 401 || result.status === 403) {
        alert("Unauthorized to perform lookup. Please login as admin.");
        setErrorMsg(
          "Unauthorized. Please log in as an admin to view payments."
        );
        return;
      }

      const newStatus =
        lookup?.status ||
        lookup?.data?.status ||
        (lookup?.status_code ? "unknown" : "error");
      // update local payments list
      setPayments((prev) =>
        prev.map((row) =>
          row._id === p._id ? { ...row, status: newStatus, lookup } : row
        )
      );
      alert(`Lookup status: ${newStatus}`);
    } catch (err) {
      console.error("Verify lookup error:", err);
      alert("Lookup failed (network or not found)");
    } finally {
      setVerifying(null);
    }
  };

  const openDetails = (p) => {
    setSelected(p);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setSelected(null);
    setDetailsOpen(false);
  };

  const exportCsv = () => {
    const token = localStorage.getItem("token");
    const url = new URL(`${API_URL}/api/payment/transactions`);
    url.searchParams.set("export", "csv");
    // include current filters if desired
    if (q) url.searchParams.set("q", q);
    // Open with token in Authorization — easiest: fetch blob and trigger download
    fetch(url.toString(), { headers: headersWithToken() })
      .then((r) => r.blob())
      .then((blob) => {
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `payments-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(href);
      })
      .catch((err) => {
        console.error("CSV export failed:", err);
        alert("Export failed");
      });
  };

  // helpers
  const statusColor = (s) => {
    if (!s) return "default";
    const st = String(s).toLowerCase();
    if (st === "completed") return "success";
    if (st === "pending" || st === "initiated") return "warning";
    if (st.includes("cancel") || st === "expired" || st === "failed")
      return "error";
    return "default";
  };

  if (loading)
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Transactions
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >{`Total: ${total} · Page ${page} / ${pages}`}</Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search book/user/pidx"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button
              variant="outlined"
              startIcon={<AutorenewIcon />}
              onClick={() => loadTransactions(1)}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={exportCsv}
            >
              Export CSV
            </Button>
          </Stack>
        </Box>

        {/* unauthorized -> show inline login */}
        {errorMsg && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning">{errorMsg}</Alert>
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Admin sign-in
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                <TextField
                  label="Email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  size="small"
                />
                <PasswordField
                  label="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAdminLogin}
                  disabled={loginLoading}
                >
                  {loginLoading ? "Signing in..." : "Sign in"}
                </Button>
              </Stack>
              {loginError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {loginError}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Desktop: table; Mobile: cards */}
        {!isSm ? (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>When</TableCell>
                  <TableCell>Book</TableCell>
                  <TableCell>Payer</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell align="right">Amount (Rs)</TableCell>
                  <TableCell>Transaction</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell sx={{ minWidth: 260 }}>
                      <Box display="flex" gap={1} alignItems="center">
                        <Avatar
                          variant="rounded"
                          src={p.book?.imageUrl || undefined}
                          sx={{ width: 56, height: 72 }}
                        />
                        <Box>
                          <Typography
                            component={RouterLink}
                            to={`/book/${p.book?._id}`}
                            sx={{
                              textDecoration: "none",
                              color: "inherit",
                              fontWeight: 600,
                            }}
                          >
                            {p.book?.bookName || "-"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ₹{(p.book?.price || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{p.user?.name || "-"}</TableCell>
                    <TableCell>{p.mobile || "-"}</TableCell>
                    <TableCell align="right">
                      {((p.amount || 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>{p.transactionId || p.pidx || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.status || "-"}
                        color={statusColor(p.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          onClick={() => handleVerify(p)}
                          disabled={verifying === p._id}
                        >
                          {verifying === p._id ? "Verifying..." : "Verify"}
                        </Button>
                        <IconButton size="small" onClick={() => openDetails(p)}>
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {payments.map((p) => (
              <Grid item xs={12} key={p._id}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box display="flex" gap={2}>
                    <Avatar
                      variant="rounded"
                      src={p.book?.imageUrl || undefined}
                      sx={{ width: 72, height: 92 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {p.book?.bookName || p.pidx || "Payment"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.user?.name || "Unknown"} •{" "}
                            {new Date(p.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={p.status || "-"}
                          color={statusColor(p.status)}
                          size="small"
                        />
                      </Box>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={1}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Amount: ₹{((p.amount || 0) / 100).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tx: {p.transactionId || p.pidx || "-"}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            onClick={() => handleVerify(p)}
                            disabled={verifying === p._id}
                          >
                            {verifying === p._id ? "Verifying..." : "Verify"}
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => openDetails(p)}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pages}
            page={page}
            onChange={(e, v) => {
              setPage(v);
              loadTransactions(v);
            }}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={closeDetails} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Avatar
                  variant="rounded"
                  src={selected.book?.imageUrl || undefined}
                  sx={{ width: "100%", height: 220, bgcolor: "grey.100" }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight={700}>
                  {selected.book?.bookName || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Buyer: {selected.user?.name || "—"} (
                  {selected.user?.email || "-"})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: ₹{((selected.amount || 0) / 100).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transaction ID:{" "}
                  {selected.transactionId || selected.pidx || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status:{" "}
                  <Chip
                    label={selected.status || "-"}
                    color={statusColor(selected.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>

                <Box mt={2}>
                  <Typography variant="subtitle2">Raw metadata</Typography>
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: "#f7f7f7",
                      p: 1,
                      borderRadius: 1,
                      maxHeight: 240,
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(
                      selected.meta || selected.lookup || {},
                      null,
                      2
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetails}>Close</Button>
          {selected?.book && (
            <Button
              component={RouterLink}
              to={`/book/${selected.book._id}`}
              endIcon={<LaunchIcon />}
            >
              Open Book
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
