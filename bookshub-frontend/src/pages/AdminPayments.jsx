import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null); // payment _id being verified

  useEffect(() => {
    fetch(`${API_URL}/api/payment/records`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) setPayments(data.payments || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (p) => {
    if (!p?.pidx) {
      alert("No pidx available for this payment.");
      return;
    }
    setVerifying(p._id);
    try {
      const resp = await fetch(`${API_URL}/api/payment/khalti/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pidx: p.pidx }),
      });
      const lookup = await resp.json();
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
      alert("Lookup failed (network)");
    } finally {
      setVerifying(null);
    }
  };

  if (loading)
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Payments
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>When</TableCell>
            <TableCell>Book</TableCell>
            <TableCell>Payer</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Amount (Rs)</TableCell>
            <TableCell>Transaction</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p._id}>
              <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
              <TableCell>{p.book?.bookName || "-"}</TableCell>
              <TableCell>{p.user?.name || "-"}</TableCell>
              <TableCell>{p.mobile || "-"}</TableCell>
              <TableCell>{(p.amount || 0) / 100}</TableCell>
              <TableCell>{p.transactionId || p.pidx || "-"}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleVerify(p)}
                  disabled={verifying === p._id}
                >
                  {verifying === p._id ? "Verifying..." : "Verify"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
