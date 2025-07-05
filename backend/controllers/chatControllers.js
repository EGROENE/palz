const mongoose = require("mongoose");

const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// get all chats in which user is member:
const getCurrentUserChats = async (req, res) => {
  const { currentUserID } = req.params;

  const chats = await Chat.find({ "members": { $in: currentUserID } });

  res.status(200).json(chats);
};

// return all users that have an index greater than or equal to passed-in index & who are not currentUser. Filtering based on whether users are already in a chat or based on privacy settings will be done in request.
const getPotentialChatMembers = async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  const potentialCMs = await User.find({
    index: { $gte: Number(start) },
    _id: { $ne: currentUser._id.toString() },
    "blockedUsers._id": { $ne: currentUser._id.toString() },
    "blockedBy._id": { $ne: currentUser._id.toString() },
    profileVisibleTo: { $ne: "nobody" },
    whoCanMessage: { $ne: "nobody" },
  }).limit(Number(limit));

  res.status(200).json(potentialCMs);
};

// create new chat:
const createChat = async (req, res) => {
  const { _id, members, messages, dateCreated, chatName, chatType, admins } = req.body;

  try {
    const chat = await Chat.create({
      _id,
      members,
      messages,
      dateCreated,
      chatName,
      chatType,
      admins,
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
  getPotentialChatMembers,
  getCurrentUserChats,
  createChat,
  deleteChat,
  updateChat,
};
