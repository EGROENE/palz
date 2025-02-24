const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  timeOpened: {
    type: Number,
    required: false,
  },
  timeSent: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Message", messageSchema);
