const mongoose = require("mongoose");

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

// delete chat:
const deleteChat = async (req, res) => {
  const { chatID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatID)) {
    return res.status(400).json({ error: "Bad request (invalid chat id)" });
  }

  const chat = await Chat.findOneAndDelete({ _id: chatID });

  if (!chat) {
    return res.status(404).json({ error: "Chat doesn't exist" });
  }

  res.status(200).json(chat);
};

// update chat:
const updateChat = async (req, res) => {
  const { chatID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatID)) {
    return res.status(400).json({ error: "Bad request (invalid chat id)" });
  }

  const chat = await Chat.findOneAndUpdate(
    { _id: chatID },
    { ...req.body },
    { new: true }
  );

  if (!chat) {
    return res.status(404).json({ error: "Chat doesn't exist" });
  }

  res.status(200).json(chat);
};

module.exports = {
  getCurrentUserChats,
  createChat,
  deleteChat,
  updateChat,
};
