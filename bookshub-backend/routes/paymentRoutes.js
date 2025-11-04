const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const Payment = require("../models/payment");
const jwt = require("jsonwebtoken");

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

// Extracted helper: perform lookup at Khalti and persist/update Payment if Completed
async function doLookupAndPersist(pidx) {
  const KHALTI_SECRET = process.env.KHALTI_SECRET;
  if (!KHALTI_SECRET)
    throw { status: 500, message: "KHALTI_SECRET not configured" };

  // Candidate bases to try (cover dev/prod variations)
  const bases = new Set([
    KHALTI_BASE, // existing configured base
    // try common variants (remove /api/v2, try /api, try host root)
    KHALTI_BASE.replace(/\/api\/v2\/?$/, "/api"),
    KHALTI_BASE.replace(/\/api\/v2\/?$/, ""),
    // explicit dev host variants (when KHALTI_BASE is dev but path differs)
    "https://dev.khalti.com/api/v2",
    "https://dev.khalti.com/api",
    "https://dev.khalti.com",
  ]);

  let lastError = null;
  let lookup = null;

  for (const base of bases) {
    if (!base) continue;
    const url = `${base.replace(/\/$/, "")}/epayment/lookup/`;
    try {
      const resp = await axios.post(
        url,
        { pidx },
        {
          headers: {
            Authorization: `Key ${KHALTI_SECRET}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );
      lookup = resp.data;
      // found working endpoint -> break
      break;
    } catch (err) {
      // If 404, try next candidate; otherwise capture and stop if it's not recoverable
      const status = err.response?.status;
      lastError = err;
      if (status === 404) {
        // try next base
        continue;
      } else if (status === 401 || status === 403 || status === 400) {
        // propagate auth/validation errors immediately
        throw err;
      } else {
        // other network errors: remember and try next
        continue;
      }
    }
  }

  if (!lookup) {
    // none of the bases worked
    const detail =
      lastError?.response?.data || lastError?.message || "Lookup failed";
    throw { status: lastError?.response?.status || 502, message: detail };
  }

  // If Completed — ensure Payment record exists/updated and try to mark book sold
  if (lookup?.status === "Completed") {
    try {
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
        payment.transactionId =
          payment.transactionId || lookup.transaction_id || lookup.tidx;
        payment.amount =
          payment.amount || lookup.total_amount || lookup.amount || null;
        payment.mobile = payment.mobile || lookup.mobile || null;
        payment.status = lookup.status;
        payment.meta = { ...(payment.meta || {}), raw: lookup };
        await payment.save();
      }

      const Book = require("../models/book");
      const productHint =
        payment.book || (lookup.purchase_order_id || "").split("-")[0];
      if (productHint) {
        try {
          await Book.findOneAndUpdate(
            { _id: productHint, isSold: { $ne: true } },
            { $set: { isSold: true } },
            { new: true }
          );
        } catch (e) {
          // ignore marking errors
        }
      }
    } catch (pErr) {
      console.error("Payment record create/update error (lookup):", pErr);
    }
  }

  return lookup;
}

// helper: map Khalti lookup status to HTTP status code per docs
function httpStatusForLookup(status) {
  // treat status case-insensitively
  if (!status) return 200;
  const s = String(status).toLowerCase();
  if (
    s === "expired" ||
    s === "user canceled" ||
    s.includes("cancel") ||
    s === "failed"
  )
    return 400;
  // Completed, Pending, Initiated, Refunded, Partially Refunded => 200
  return 200;
}

// POST /api/payment/khalti/lookup
// Body: { pidx } -> call Khalti lookup and return canonical status. If Completed -> persist and mark book sold.
router.post("/khalti/lookup", async (req, res) => {
  const { pidx } = req.body || {};
  if (!pidx)
    return res
      .status(400)
      .json({ success: false, message: "pidx is required" });
  try {
    const lookup = await doLookupAndPersist(pidx);
    const code = httpStatusForLookup(lookup?.status);
    return res.status(code).json(lookup);
  } catch (err) {
    console.error("Khalti lookup error:", err);
    const status = err.status || err.response?.status || 502;
    const detail = err.message || err.response?.data || err;
    return res
      .status(status)
      .json({ success: false, message: "Khalti lookup failed", detail });
  }
});

// Backwards-compatible route
router.post("/lookup", async (req, res) => {
  const { pidx } = req.body || {};
  if (!pidx)
    return res
      .status(400)
      .json({ success: false, message: "pidx is required" });
  try {
    const lookup = await doLookupAndPersist(pidx);
    const code = httpStatusForLookup(lookup?.status);
    return res.status(code).json(lookup);
  } catch (err) {
    console.error("Khalti lookup error (lookup route):", err);
    const status = err.status || err.response?.status || 502;
    const detail = err.message || err.response?.data || err;
    return res
      .status(status)
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

// Simple JWT auth middleware (uses JWT_SECRET from .env)
function verifyToken(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // attach decoded token (should contain _id and role)
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ success: false, message: "Forbidden - admin only" });
  return next();
}

// ADD new route: POST /api/payment/record
// Protected: requires authentication (any logged-in user). userId will be taken from token.
router.post("/record", verifyToken, async (req, res) => {
  // body: { productId, amount (paisas), mobile, transactionId, pidx }
  const { productId, amount, mobile, transactionId, pidx } = req.body;
  const userId = req.user ? req.user._id : null;
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
    return res.status(500).json({
      success: false,
      message: "Could not record payment",
      detail: err.message || err,
    });
  }
});

// ADD new route: GET /api/payment/records to list payments (admin)
router.get("/records", verifyToken, requireAdmin, async (req, res) => {
  try {
    // include imageUrl so admin UI can display book picture
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .populate("book", "bookName price imageUrl")
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

/**
 * GET /api/payment/transactions
 * Admin-only. Returns paginated list of transactions with populated user and book info.
 * Query params:
 *  - page (default 1), limit (default 50)
 *  - userId, bookId, status
 *  - from (ISO date), to (ISO date)
 *  - export=csv  -> returns CSV download
 */
router.get("/transactions", verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      200,
      Math.max(1, parseInt(req.query.limit || "50", 10))
    );
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.userId) filters.user = req.query.userId;
    if (req.query.bookId) filters.book = req.query.bookId;
    if (req.query.status) filters.status = req.query.status;

    if (req.query.from || req.query.to) {
      filters.createdAt = {};
      if (req.query.from) {
        const fromDate = new Date(req.query.from);
        if (!isNaN(fromDate)) filters.createdAt.$gte = fromDate;
      }
      if (req.query.to) {
        const toDate = new Date(req.query.to);
        if (!isNaN(toDate)) filters.createdAt.$lte = toDate;
      }
      // remove empty createdAt
      if (Object.keys(filters.createdAt).length === 0) delete filters.createdAt;
    }

    const total = await Payment.countDocuments(filters);
    const payments = await Payment.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("book", "bookName price imageUrl")
      .lean();

    // CSV export support
    if (String(req.query.export || "").toLowerCase() === "csv") {
      const rows = payments.map((p) => {
        const amountRs = (p.amount || 0) / 100;
        return {
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
          paymentId: p._id,
          pidx: p.pidx || "",
          transactionId: p.transactionId || "",
          status: p.status || "",
          amountRs,
          mobile: p.mobile || "",
          userId: p.user?._id || "",
          userName: p.user?.name || "",
          userEmail: p.user?.email || "",
          bookId: p.book?._id || "",
          bookName: p.book?.bookName || "",
        };
      });

      // Build CSV string
      const header = [
        "createdAt",
        "paymentId",
        "pidx",
        "transactionId",
        "status",
        "amountRs",
        "mobile",
        "userId",
        "userName",
        "userEmail",
        "bookId",
        "bookName",
      ];
      const csvLines = [header.join(",")];
      for (const r of rows) {
        const line = header.map((h) => {
          const v = r[h] ?? "";
          // escape double quotes
          const s = String(v).replace(/"/g, '""');
          // wrap if contains comma or quote or newline
          if (/[",\n]/.test(s)) return `"${s}"`;
          return s;
        });
        csvLines.push(line.join(","));
      }
      const csv = csvLines.join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="payments-${Date.now()}.csv"`
      );
      return res.send(csv);
    }

    return res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      payments,
    });
  } catch (err) {
    console.error("Transactions list error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not fetch transactions",
      detail: err.message || err,
    });
  }
});

/**
 * GET /api/payment/transactions/:id
 * Admin-only. Returns single transaction with populated user and book.
 */
router.get("/transactions/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payment = await Payment.findById(id)
      .populate("user", "name email")
      .populate("book", "bookName price imageUrl")
      .lean();
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    return res.json({ success: true, payment });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not fetch transaction",
      detail: err.message || err,
    });
  }
});

module.exports = router;
