const Message = require("../models/messageModel");

// get all messages in which currentUser is sender:
const getSentMessages = async (req, res) => {
  const { sender } = req.params;
  const sentMessages = await Message.find({ sender: sender });

  res.status(200).json(sentMessages);
};

// get all messages in which currentUser is receiver:

// create new message:

// delete message:

// update message:

module.exports = {
  getSentMessages,
};
