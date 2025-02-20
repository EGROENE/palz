const mongoose = require("mongoose");

const Message = require("../models/messageModel");

const Chat = require("../models/chatModel");

// get all chats in which user is member:
const getCurrentUserChats = async (req, res) => {
  const { currentUserID } = req.params;

  const chats = await Chat.find({ members: currentUserID });

  res.status(200).json(chats);
};

// create new chat:
const createChat = async (req, res) => {
  const { members, messages, dateCreated } = req.body;

  try {
    const chat = await Chat.create({
      members,
      messages,
      dateCreated,
    });
    res.status(200).json(chat);
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
  createChat,
  deleteMessage,
  updateMessage,
};
