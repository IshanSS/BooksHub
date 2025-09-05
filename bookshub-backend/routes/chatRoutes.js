const express = require("express");
const {
  sendMessage,
  getMessages,
  getConversation,
} = require("../controller/messageController");
const authenticate = require("../middleware/jwtMiddleware");

const router = express.Router();

router.post("/send", authenticate, sendMessage);
router.get("/messages", authenticate, getMessages);
router.get("/", authenticate, getConversation);

module.exports = router;
