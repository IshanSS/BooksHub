const express = require("express");
const router = express.Router();
const axios = require("axios");

// POST /api/payment/khalti/verify
// body: { token: string, amount: number, productId?: string, useTest?: boolean }  // amount in paisa (integer)
router.post("/khalti/verify", async (req, res) => {
  const { token, amount, productId, useTest } = req.body;
  // choose secret: if frontend asked to use test and a test secret exists, use it
  const KHALTI_SECRET =
    useTest && process.env.KHALTI_TEST_SECRET
      ? process.env.KHALTI_TEST_SECRET
      : process.env.KHALTI_SECRET;

  if (!KHALTI_SECRET) {
    return res
      .status(500)
      .json({ success: false, message: "KHALTI_SECRET not configured" });
  }
  if (!token || !amount) {
    return res
      .status(400)
      .json({ success: false, message: "token and amount are required" });
  }

  try {
    const resp = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      { token, amount },
      { headers: { Authorization: `Key ${KHALTI_SECRET}` } }
    );

    // resp.data contains verification details
    // try to persist resp.data (transaction) and mark order/book as paid if productId provided
    let updatedBook = null;
    if (productId) {
      try {
        // require Book model using the consistent lowercase path used across the project
        let Book = null;
        try {
          Book = require("../models/book");
        } catch (e) {
          Book = null;
        }
        if (Book && typeof Book.findByIdAndUpdate === "function") {
          updatedBook = await Book.findByIdAndUpdate(
            productId,
            { isSold: true },
            { new: true }
          );
        }
      } catch (errUpdate) {
        // don't fail verification for DB/model issues; just log
        console.error(
          "Could not update book after payment:",
          errUpdate.message || errUpdate
        );
      }
    }

    return res.json({ success: true, data: resp.data, updatedBook });
  } catch (error) {
    const detail = error.response?.data || error.message;
    return res
      .status(400)
      .json({ success: false, message: "Khalti verification failed", detail });
  }
});

module.exports = router;
