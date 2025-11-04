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

// POST /api/payment/khalti/initiate
// Forward request to Khalti initiate, persist initiation record for later lookup/callback
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

    const data = resp.data;

    // persist an initiation record (status: Initiated). store product hint from merchant_extra if present
    try {
      await Payment.create({
        book: payload.merchant_extra || null,
        user: null,
        pidx: data?.pidx || null,
        purchase_order_id: payload.purchase_order_id,
        amount: payload.amount,
        mobile: payload.customer_info?.phone || "",
        status: "Initiated",
        meta: { initiateResponse: data },
      });
    } catch (pErr) {
      console.error("Failed to persist initiation:", pErr);
      // don't fail the whole response if persistence fails; return Khalti response anyway
    }

    return res.status(resp.status).json(data);
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

// POST /api/payment/khalti/lookup
// Body: { pidx } -> call Khalti lookup and return canonical status. If Completed -> persist and mark book sold.
router.post("/khalti/lookup", async (req, res) => {
  const KHALTI_SECRET = process.env.KHALTI_SECRET;
  if (!KHALTI_SECRET)
    return res
      .status(500)
      .json({ success: false, message: "KHALTI_SECRET not configured" });

  const { pidx } = req.body;
  if (!pidx)
    return res
      .status(400)
      .json({ success: false, message: "pidx is required" });

  try {
    const resp = await axios.post(
      `${KHALTI_BASE}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const lookup = resp.data;

    // idempotent: if Completed, ensure Payment record exists and mark book sold
    if (lookup?.status === "Completed") {
      try {
        // find existing payment by pidx or purchase_order_id
        let payment = await Payment.findOne({ pidx });
        if (!payment && lookup.purchase_order_id) {
          payment = await Payment.findOne({
            purchase_order_id: lookup.purchase_order_id,
          });
        }
        if (!payment) {
          payment = await Payment.create({
            book: null,
            user: null,
            pidx: lookup.pidx || pidx,
            purchase_order_id: lookup.purchase_order_id || null,
            transactionId: lookup.transaction_id || lookup.tidx || null,
            amount: lookup.total_amount || lookup.amount || null,
            mobile: lookup.mobile || null,
            status: lookup.status,
            meta: { raw: lookup },
          });
        } else {
          // update existing payment
          payment.transactionId =
            payment.transactionId || lookup.transaction_id || lookup.tidx;
          payment.amount =
            payment.amount || lookup.total_amount || lookup.amount || null;
          payment.mobile = payment.mobile || lookup.mobile || null;
          payment.status = lookup.status;
          payment.meta = { ...(payment.meta || {}), raw: lookup };
          await payment.save();
        }

        // try to mark book sold if purchase_order_id contains product hint or payment.book present
        const Book = require("../models/book");
        const productHint =
          payment.book || (lookup.purchase_order_id || "").split("-")[0];
        if (productHint) {
          try {
            const updated = await Book.findOneAndUpdate(
              { _id: productHint, isSold: { $ne: true } },
              { $set: { isSold: true } },
              { new: true }
            );
            // nothing else required; admin can inspect Payment records
          } catch (e) {
            // ignore marking errors
          }
        }
      } catch (pErr) {
        console.error("Payment record create/update error (lookup):", pErr);
      }
    }

    return res.json(lookup);
  } catch (err) {
    console.error("Khalti lookup error:", err.message || err);
    const detail = err.response?.data || err.message;
    return res
      .status(err.response?.status || 502)
      .json({ success: false, message: "Khalti lookup failed", detail });
  }
});

// GET /api/payment/khalti/callback
// Called by Khalti via browser redirect. We perform server-side lookup to verify status, update DB and redirect user to frontend.
router.get("/khalti/callback", async (req, res) => {
  const KHALTI_SECRET = process.env.KHALTI_SECRET;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  const { pidx, status, purchase_order_id } = req.query;

  if (!pidx && !purchase_order_id) {
    // nothing to verify
    return res.redirect(`${FRONTEND_URL}/?payment=invalid_callback`);
  }

  if (!KHALTI_SECRET) {
    return res.redirect(`${FRONTEND_URL}/?payment=error`);
  }

  try {
    // perform server->server lookup to get canonical details
    const resp = await axios.post(
      `${KHALTI_BASE}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const lookup = resp.data;

    // Find related initiation / payment record
    let payment = null;
    if (lookup?.pidx) payment = await Payment.findOne({ pidx: lookup.pidx });
    if (!payment && lookup?.purchase_order_id)
      payment = await Payment.findOne({
        purchase_order_id: lookup.purchase_order_id,
      });
    if (!payment && purchase_order_id)
      payment = await Payment.findOne({ purchase_order_id });

    // Validate and process Completed
    if (lookup?.status === "Completed") {
      // determine productId (book) from payment.book or purchase_order_id hint
      let productId = payment?.book || null;
      if (!productId && lookup.purchase_order_id) {
        const parts = String(lookup.purchase_order_id).split("-");
        if (parts.length > 1) productId = parts[0];
      }
      // fallback: use payment.meta.initiateResponse?.merchant_extra
      if (!productId && payment?.meta?.initiateResponse?.merchant_extra)
        productId = payment.meta.initiateResponse.merchant_extra;

      // create or update Payment record
      try {
        if (!payment) {
          payment = await Payment.create({
            book: productId || null,
            user: null,
            pidx: lookup.pidx || pidx,
            purchase_order_id:
              lookup.purchase_order_id || purchase_order_id || null,
            transactionId: lookup.transaction_id || lookup.tidx || null,
            amount: lookup.total_amount || lookup.amount || null,
            mobile: lookup.mobile || null,
            status: lookup.status,
            meta: { raw: lookup, source: "khalti_callback" },
          });
        } else {
          payment.transactionId =
            payment.transactionId || lookup.transaction_id || lookup.tidx;
          payment.amount =
            payment.amount || lookup.total_amount || lookup.amount || null;
          payment.mobile = payment.mobile || lookup.mobile || null;
          payment.status = lookup.status;
          payment.meta = {
            ...(payment.meta || {}),
            raw: lookup,
            source: "khalti_callback",
          };
          await payment.save();
        }
      } catch (pErr) {
        console.error(
          "Failed to create/update payment record (callback):",
          pErr
        );
      }

      // atomically mark book sold
      if (productId) {
        try {
          const Book = require("../models/book");
          const updatedBook = await Book.findOneAndUpdate(
            { _id: productId, isSold: { $ne: true } },
            { $set: { isSold: true } },
            { new: true }
          );

          if (updatedBook) {
            return res.redirect(
              `${FRONTEND_URL}/books/${productId}?payment=success&thankyou=true`
            );
          } else {
            // book not found or already sold
            const check = await require("../models/book")
              .findById(productId)
              .lean();
            if (check && check.isSold) {
              return res.redirect(
                `${FRONTEND_URL}/books/${productId}?payment=success&note=already_sold&thankyou=true`
              );
            }
            return res.redirect(`${FRONTEND_URL}/?payment=notfound`);
          }
        } catch (err) {
          console.error("Book update error (callback):", err);
          // still redirect to success with note to inspect admin logs
          return res.redirect(
            `${FRONTEND_URL}/?payment=success&note=update_failed&thankyou=true`
          );
        }
      }

      // if we don't have a productId, still redirect to generic success page
      return res.redirect(`${FRONTEND_URL}/?payment=success&thankyou=true`);
    }

    // handle pending / canceled / failed
    const canonicalStatus = lookup?.status || status || "failed";
    try {
      if (!payment) {
        await Payment.create({
          book: null,
          user: null,
          pidx: lookup?.pidx || pidx || null,
          purchase_order_id:
            lookup?.purchase_order_id || purchase_order_id || null,
          transactionId: lookup?.transaction_id || lookup?.tidx || null,
          amount: lookup?.total_amount || lookup?.amount || null,
          mobile: lookup?.mobile || null,
          status: canonicalStatus,
          meta: { raw: lookup || req.query, source: "khalti_callback" },
        });
      } else {
        payment.status = canonicalStatus;
        payment.meta = {
          ...(payment.meta || {}),
          raw: lookup || req.query,
          source: "khalti_callback",
        };
        await payment.save();
      }
    } catch (pErr) {
      console.error("Failed to persist non-complete payment (callback):", pErr);
    }

    if (canonicalStatus === "Pending") {
      return res.redirect(`${FRONTEND_URL}/?payment=pending`);
    }
    if (
      canonicalStatus === "User canceled" ||
      canonicalStatus.toLowerCase().includes("cancel")
    ) {
      return res.redirect(
        `${FRONTEND_URL}/?payment=failed&reason=user_canceled`
      );
    }

    return res.redirect(`${FRONTEND_URL}/?payment=failed`);
  } catch (err) {
    console.error("Callback handling error:", err);
    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/?payment=error`
    );
  }
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
