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

// delete message:

// update message:

module.exports = {
  getCurrentUserMessages,
};
