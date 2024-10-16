const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  stateProvince: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phoneCountry: {
    type: String,
    required: true,
  },
  phoneCountryCode: {
    type: String,
    required: true,
  },
  phoneCountryWithoutCountryCode: {
    type: String,
    required: true,
  },
  instagram: {
    type: String,
    required: true,
  },
  facebook: {
    type: String,
    required: true,
  },
  x: {
    type: String,
    required: true,
  },
  interests: {
    type: Array,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  friendRequestsReceived: {
    type: Array,
    required: true,
  },
  friendRequestsSent: {
    type: Array,
    required: true,
  },
  hostingCredits: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  profileVisibleTo: {
    type: String,
    required: true,
  },
  subscriptionType: {
    type: String,
    required: true,
  },
  whoCanAddUserAsOrganizer: {
    type: String,
    required: true,
  },
  whoCanInviteUser: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  friends: {
    type: Array,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
