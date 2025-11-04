const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const Payment = require("../models/payment");

// choose Khalti base (use sandbox flag if needed)
const KHALTI_BASE =
  process.env.KHALTI_SANDBOX === "true"
    ? "https://dev.khalti.com/api/v2"
    : "https://khalti.com/api/v2";

// helper to build backend callback URL
function getBackendReturnUrl() {
  return (
    (process.env.BACKEND_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:3000") + "/api/payment/khalti/callback"
  );
}

// DIAGNOSTIC: GET /api/payment/debug
router.get("/debug", (req, res) => {
  const secret = process.env.KHALTI_SECRET || null;
  return res.json({
    khaltiBase: KHALTI_BASE,
    khaltiSandbox: process.env.KHALTI_SANDBOX === "true",
    secretConfigured: !!secret,
    maskedSecret: secret
      ? secret.length > 8
        ? `${secret.slice(0, 4)}...${secret.slice(-4)}`
        : "****"
      : null,
  });
});

// Minimal Khalti initiate proxy for quick testing (POST /api/payment/khalti/initiate)
// For local testing this forwards the request body to Khalti initiate endpoint
// Ensure KHALTI_SECRET is set in backend .env before testing
router.post("/khalti/initiate", async (req, res) => {
  const KHALTI_SECRET = process.env.KHALTI_SECRET;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  if (!KHALTI_SECRET) {
    return res
      .status(500)
      .json({ success: false, message: "KHALTI_SECRET not configured" });
  }

  // Build payload from client but ensure required fields exist
  const payload = { ...(req.body || {}) };

  // Ensure return_url and website_url are present (Khalti requires return_url)
  if (!payload.return_url) payload.return_url = getBackendReturnUrl();
  if (!payload.website_url) payload.website_url = FRONTEND_URL;

  // Generate purchase_order_id if missing (include product id if available)
  if (!payload.purchase_order_id) {
    const productIdHint =
      payload.merchant_extra ||
      (payload.product_details &&
        payload.product_details[0] &&
        payload.product_details[0].identity) ||
      "order";
    payload.purchase_order_id = `${productIdHint}-${Date.now()}`;
  }

  // Normalize and validate amount (must be integer paisa >= 1000)
  payload.amount = Number(payload.amount);
  if (!Number.isInteger(payload.amount) || payload.amount < 1000) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid amount. amount must be an integer (paisas) and >= 1000 (Rs.10).",
    });
  }

  try {
    const resp = await axios.post(
      `${KHALTI_BASE}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return res.status(resp.status).json(resp.data);
  } catch (err) {
    const detail = err.response?.data || err.message;
    const status = err.response?.status || 502;
    if (status === 401) {
      return res.status(401).json({
        success: false,
        message:
          "Khalti initiate failed: Invalid token (401). Verify KHALTI_SECRET and KHALTI_SANDBOX (sandbox vs production).",
        detail,
        hint: "Common causes: using a sandbox secret against production endpoint or vice-versa. If testing against dev.khalti.com set KHALTI_SANDBOX=true in backend .env and restart.",
      });
    }
    return res
      .status(status)
      .json({ success: false, message: "Khalti initiate failed", detail });
  }
});

// modify lookup handler: when lookup.status === "Completed" and book marked, create Payment
router.post("/khalti/lookup", async (req, res) => {
  // ...existing lookup code...

  if (updatedBook) {
    try {
      await Payment.create({
        book: updatedBook._id,
        pidx: lookup.pidx || null,
        transactionId: lookup.transaction_id || lookup.tidx || null,
        amount: lookup.total_amount || lookup.amount || null,
        mobile: lookup.mobile || null,
        status: lookup.status,
        meta: { source: "khalti_lookup" },
      });
    } catch (pErr) {
      console.error("Failed to create Payment record (lookup):", pErr);
    }
  }

  // ...existing response code...
});

// modify callback handler: when lookup.status === "Completed" and after book updated, create Payment
router.get("/khalti/callback", async (req, res) => {
  // ...existing callback code...

  if (book) {
    try {
      await Payment.create({
        book: book._id,
        pidx: lookup.pidx || null,
        transactionId: lookup.transaction_id || lookup.tidx || null,
        amount: lookup.total_amount || lookup.amount || null,
        mobile: lookup.mobile || null,
        status: lookup.status,
        meta: { source: "khalti_callback" },
      });
    } catch (pErr) {
      console.error("Failed to create Payment record (callback):", pErr);
    }
  }

  // ...existing response code...
});

// ADD new route: POST /api/payment/record
router.post("/record", async (req, res) => {
  // body: { productId, amount (paisas), mobile, transactionId, userId, pidx }
  const { productId, amount, mobile, transactionId, userId, pidx } = req.body;
  if (!productId || !amount) {
    return res
      .status(400)
      .json({ success: false, message: "productId and amount required" });
  }
  try {
    // atomically mark book sold
    const Book = require("../models/book");
    const book = await Book.findOneAndUpdate(
      { _id: productId, isSold: { $ne: true } },
      { $set: { isSold: true } },
      { new: true }
    );
    if (!book) {
      const check = await Book.findById(productId).lean();
      if (check && check.isSold) {
        // still create payment record but note already sold
        const pm = await Payment.create({
          book: productId,
          user: userId || null,
          pidx: pidx || null,
          transactionId: transactionId || `sandbox-${Date.now()}`,
          amount,
          mobile: mobile || "",
          status: "Completed",
          meta: { source: "sandbox_record", note: "book_already_sold" },
        });
        return res.json({ success: true, note: "already_sold", payment: pm });
      }
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    const pm = await Payment.create({
      book: book._id,
      user: userId || null,
      pidx: pidx || null,
      transactionId: transactionId || `sandbox-${Date.now()}`,
      amount,
      mobile: mobile || "",
      status: "Completed",
      meta: { source: "sandbox_record" },
    });

    return res.json({ success: true, payment: pm, updatedBook: book });
  } catch (err) {
    console.error("Record payment error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Could not record payment",
        detail: err.message || err,
      });
  }
});

// ADD new route: GET /api/payment/records to list payments (admin)
router.get("/records", async (req, res) => {
  try {
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .populate("book", "bookName price")
      .populate("user", "name email")
      .lean();
    return res.json({ success: true, payments });
  } catch (err) {
    console.error("Payments list error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not fetch payments" });
  }
});

module.exports = router;
