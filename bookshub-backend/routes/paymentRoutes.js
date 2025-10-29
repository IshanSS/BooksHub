const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/khalti/verify", async (req, res) => {
  const { token, amount } = req.body;
  try {
    const khaltiRes = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      { token, amount },
      {
        headers: {
          Authorization: "Key 544ca18bc81742898da101cac2dca21e", // Replace with your secret key
        },
      }
    );
    res.json(khaltiRes.data);
  } catch (error) {
    res.status(400).json({
      message: "Khalti verification failed",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
