import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button as MuiButton,
  Box,
  Alert,
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

// Sandbox test credentials (per your message)
const SANDBOX_IDS = new Set([
  "9800000000",
  "9800000001",
  "9800000002",
  "9800000003",
  "9800000004",
  "9800000005",
]);
const SANDBOX_MPIN = "1111";
const SANDBOX_OTP = "987654";

export default function KhaltiPaymentButton({
  amount = 100,
  productName,
  productId,
  productSold = false,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  // dialog state
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: phone+mpin, 2: otp
  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleOpen = () => {
    if (productSold) {
      alert("This book is already sold.");
      return;
    }
    setOpen(true);
    setStep(1);
    setPhone("");
    setMpin("");
    setOtp("");
    setError("");
    setSuccessMessage("");
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setError("");
    setSuccessMessage("");
  };

  const handleVerifyPhoneMpin = () => {
    setError("");
    const normalized = String(phone || "").trim();
    if (!normalized) {
      setError("Enter phone number.");
      return;
    }
    if (!/^\d{10}$/.test(normalized)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!mpin) {
      setError("Enter MPIN.");
      return;
    }
    // If sandbox test credentials, proceed to OTP step
    if (SANDBOX_IDS.has(normalized) && mpin === SANDBOX_MPIN) {
      setStep(2);
      setError("");
      return;
    }

    // Not a sandbox test pair: close dialog and continue with real flow
    setOpen(false);
    // start real flow (redirect to Khalti)
    initiateRealFlow();
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp) {
      setError("Enter OTP.");
      return;
    }
    if (otp !== SANDBOX_OTP) {
      setError("Invalid OTP.");
      return;
    }

    // Persist simulated payment on server
    try {
      const token = localStorage.getItem("token");
      let userId = null;
      if (token) {
        try {
          userId = JSON.parse(atob(token.split(".")[1]))._id;
        } catch (e) {
          userId = null;
        }
      }
      const amountPaisa = Math.round(Number(amount) * 100);
      const transactionId = `sandbox-${Date.now()}`;
      const resp = await fetch(`${API_URL}/api/payment/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          productId,
          amount: amountPaisa,
          mobile: phone,
          transactionId,
          userId,
          pidx: `sandbox-${Date.now()}`,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setSuccessMessage("Payment successful. Thank you!");
        if (typeof onSuccess === "function")
          onSuccess(data.updatedBook || null);
        setTimeout(() => setOpen(false), 800);
        return;
      }
      console.error("Record payment failed:", data);
      setError(data.message || "Failed to record payment");
    } catch (err) {
      console.error("Record payment error:", err);
      setError("Network error recording payment");
    }
  };

  // existing real initiate flow (redirect to backend -> khalti)
  const initiateRealFlow = async () => {
    setLoading(true);
    try {
      const amountPaisa = Math.round(Number(amount) * 100);
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const initiateBody = {
        // backend will ensure return_url/purchase_order_id
        website_url: window.location.origin,
        amount: amountPaisa,
        product_details: [
          {
            identity: productId,
            name: productName,
            total_price: amountPaisa,
            quantity: 1,
            unit_price: amountPaisa,
          },
        ],
        purchase_order_name: productName || `Purchase ${productId}`,
        customer_info: user
          ? {
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
            }
          : undefined,
        merchant_extra: productId,
      };

      const resp = await fetch(`${API_URL}/api/payment/khalti/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initiateBody),
      });
      const data = await resp.json();

      // success responses vary: try multiple shapes
      const paymentUrl =
        data?.payment_url ||
        data?.data?.payment_url ||
        (data?.pidx ? `https://test-pay.khalti.com/?pidx=${data.pidx}` : null);
      if (resp.ok && paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      // show error
      console.error("Initiate failed:", data);
      alert(
        data.message || "Failed to initiate payment. Check console for details."
      );
    } catch (err) {
      console.error("Initiate error:", err);
      alert("Network error initiating payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={loading || productSold}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          background: productSold ? "#888" : "#5C2D91",
          color: "#fff",
          border: "none",
          fontWeight: "bold",
          cursor: productSold ? "not-allowed" : "pointer",
        }}
      >
        {productSold ? "Sold" : loading ? "Redirecting..." : "Pay with Khalti"}
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 360, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            background: "#5C2D91",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          {step === 1 ? "Pay with Khalti" : "Enter OTP"}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: "#fff", pb: 2 }}>
          {error && (
            <Box mb={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {successMessage && (
            <Box mb={2}>
              <Alert severity="success">{successMessage}</Alert>
            </Box>
          )}

          {step === 1 && (
            <>
              <TextField
                label="Phone (10 digits)"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                margin="dense"
                variant="filled"
                InputProps={{ disableUnderline: true }}
              />
              <TextField
                label="MPIN"
                fullWidth
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                margin="dense"
                type="password"
                variant="filled"
                InputProps={{ disableUnderline: true }}
              />
            </>
          )}

          {step === 2 && (
            <>
              <TextField
                label="OTP"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                margin="dense"
                variant="filled"
                InputProps={{ disableUnderline: true }}
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <MuiButton onClick={handleClose}>Cancel</MuiButton>
          {step === 1 ? (
            <MuiButton
              onClick={handleVerifyPhoneMpin}
              variant="contained"
              sx={{
                bgcolor: "#5C2D91",
                color: "#fff",
                "&:hover": { bgcolor: "#4b255f" },
              }}
            >
              Continue
            </MuiButton>
          ) : (
            <MuiButton
              onClick={handleVerifyOtp}
              variant="contained"
              sx={{
                bgcolor: "#5C2D91",
                color: "#fff",
                "&:hover": { bgcolor: "#4b255f" },
              }}
            >
              Verify OTP
            </MuiButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
