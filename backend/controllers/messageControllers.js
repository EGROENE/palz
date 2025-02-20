const mongoose = require("mongoose");

const Message = require("../models/messageModel");

const Chat = require("../models/chatModel");

// get all chats in which user is member:
const getCurrentUserChats = async (req, res) => {
  const { currentUserID } = req.params;

  const chats = await Chat.find({ members: currentUserID });

  res.status(200).json(chats);
};

// create new message:
const createMessage = async (req, res) => {
  const { sender, receiver, content, image, timeOpened, timeSent } = req.body;

  try {
    const message = await Message.create({
      sender,
      receiver,
      content,
      image,
      timeOpened,
      timeSent,
    });
    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete message:
const deleteMessage = async (req, res) => {
  const { messageID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageID)) {
    return res.status(400).json({ error: "Bad request (invalid message id)" });
  }

  const message = await Message.findOneAndDelete({ _id: messageID });

  if (!message) {
    return res.status(404).json({ error: "Message doesn't exist" });
  }

  res.status(200).json(message);
};

// update message:
const updateMessage = async (req, res) => {
  const { messageID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageID)) {
    return res.status(400).json({ error: "Bad request (invalid message id)" });
  }

  const message = await Message.findOneAndUpdate(
    { _id: messageID },
    { ...req.body },
    { new: true }
  );

  if (!message) {
    return res.status(404).json({ error: "Message doesn't exist" });
  }

  res.status(200).json(message);
};

module.exports = {
  getCurrentUserChats,
  createMessage,
  deleteMessage,
  updateMessage,
};
