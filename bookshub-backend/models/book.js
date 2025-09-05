const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  subject: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, required: true },
  author: { type: String, required: true },
  priceType: { type: String, required: true },
  mrp: { type: Number, required: true },
  branch: { type: String, required: true },
  noOfPages: { type: Number, required: true },
  edition: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isSold: { type: Boolean, default: false },
  tags: [{ type: String }],
  wishListedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Book", bookSchema);
