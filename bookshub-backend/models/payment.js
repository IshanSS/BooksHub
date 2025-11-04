const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    pidx: { type: String },
    transactionId: { type: String },
    amount: { type: Number }, // paisa
    mobile: { type: String, default: "" },
    status: { type: String, default: "Completed" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
