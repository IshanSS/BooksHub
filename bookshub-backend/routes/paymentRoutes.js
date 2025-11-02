const express = require("express");
const router = express.Router();
const axios = require("axios");

// POST /api/payment/khalti/verify
// body: { token: string, amount: number, productId: string }  // amount in paisa
router.post("/khalti/verify", async (req, res) => {
  const { token, amount, productId } = req.body;
  const KHALTI_SECRET = process.env.KHALTI_SECRET;
  if (!KHALTI_SECRET) {
    return res.status(500).json({
      success: false,
      message: "KHALTI_SECRET not configured on server",
    });
  }
  if (!token || !amount || !productId) {
    return res.status(400).json({
      success: false,
      message: "token, amount and productId are required",
    });
  }

  try {
    // Verify with Khalti
    const resp = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      { token, amount },
      { headers: { Authorization: `Key ${KHALTI_SECRET}` } }
    );

    // Khalti verification returned data
    const ver = resp.data;

    // Optional sanity: ensure Khalti returned an amount and it matches requested amount
    // Many Khalti responses include amount in paisa under ver.amount or ver.idx; adjust if your response shape differs.
    const khaltiAmount = ver?.amount ?? ver?.transaction_amount ?? null;
    if (khaltiAmount !== null && Number(khaltiAmount) !== Number(amount)) {
      // amounts differ — do not mark sold
      return res.status(400).json({
        success: false,
        message: "Khalti verification amount mismatch",
        detail: { expected: amount, khalti: khaltiAmount },
      });
    }

    // If verification succeeded, attempt to atomically mark book sold
    let updatedBook = null;
    try {
      const Book = require("../models/book"); // adjust path/name if different
      if (Book && typeof Book.findOneAndUpdate === "function") {
        const book = await Book.findOneAndUpdate(
          { _id: productId, isSold: { $ne: true } },
          { $set: { isSold: true } },
          { new: true }
        );
        if (!book) {
          // check if book exists and is already sold
          const check = await Book.findById(productId).lean();
          if (check && check.isSold) {
            return res
              .status(400)
              .json({ success: false, message: "Book already sold" });
          }
          return res
            .status(404)
            .json({ success: false, message: "Book not found" });
        }
        updatedBook = book;
      }
    } catch (errModel) {
      console.error(
        "Book model update skipped/error:",
        errModel.message || errModel
      );
    }

    return res.json({ success: true, data: ver, updatedBook });
  } catch (error) {
    const detail = error.response?.data || error.message;
    return res
      .status(400)
      .json({ success: false, message: "Khalti verification failed", detail });
  }
});

module.exports = router;
