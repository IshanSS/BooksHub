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
} from "@mui/material";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${
        process.env.REACT_APP_API_URL || "http://localhost:5010"
      }/api/payment/records`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) setPayments(data.payments || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
