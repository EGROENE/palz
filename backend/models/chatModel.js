const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* const messageSchema = new Schema({
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
}); */

const barebonesUser = new Schema({
  _id: String | mongoose.Types.ObjectId,
  username: String,
  firstName: String,
  lastName: String,
  profileImage: String,
  emailAddress: String,
  index: Number,
});

const chatSchema = new Schema({
  _id: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  members: {
    type: [barebonesUser],
    required: true,
  },
  messages: {
    type: Array,
    required: true,
  },
  dateCreated: {
    type: Number,
    required: true,
  },
  chatName: {
    type: String,
    required: false,
  },
  chatType: {
    type: String,
    required: true,
  },
  admins: {
    type: [barebonesUser],
    required: false,
  },
});

module.exports = mongoose.model("Chat", chatSchema);
