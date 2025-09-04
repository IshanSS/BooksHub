const Message = require("../models/mesage");

// @desc Send a message

const sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;
    const message = await Message.create({
      from: req.user._id,
      to,
      content,
      fromName: req.user.name,
    });
    res.status(201).json({
      status: "Success",
      message,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: error.message });
  }
};

// @desc get chat between logged-in user and another user
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id },
      ],
    }).sort({ sentAt: 1 });
    res.json(messages);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// @desc Get converstations (distinct users)
const getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.from.toString() !== req.user._id.toString())
        userIds.add(msg.from);
      if (msg.to.toString() !== req.user._id.toString()) userIds.add(msg.to);
    });

    res.json([...userIds]);
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

module.exports = { sendMessage, getMessages, getConversation };
