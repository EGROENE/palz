const Message = require("../models/messageModel");

// get all messages in which currentUser is sender:
const getCurrentUserMessages = async (req, res) => {
  const { currentUserID } = req.params;
  console.log(currentUserID);
  const sentMessages = await Message.find({
    $or: [{ sender: currentUserID }, { receiver: currentUserID }],
  });

  res.status(200).json(sentMessages);
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

// update message:

module.exports = {
  getCurrentUserMessages,
  createMessage,
};
