const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  index: {
    type: String,
    required: true,
  },
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
    required: false,
  },
  stateProvince: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  phoneCountry: {
    type: String,
    required: false,
  },
  phoneCountryCode: {
    type: String,
    required: false,
  },
  phoneNumberWithoutCountryCode: {
    type: String,
    required: false,
  },
  instagram: {
    type: String,
    required: false,
  },
  facebook: {
    type: String,
    required: false,
  },
  x: {
    type: String,
    required: false,
  },
  interests: {
    type: Array,
    required: true,
  },
  about: {
    type: String,
    required: false,
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
    required: false,
  },
  profileVisibleTo: {
    type: String,
    required: true,
  },
  whoCanMessage: {
    type: String,
    required: true,
  },
  subscriptionType: {
    type: String,
    required: false,
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
  blockedUsers: {
    type: Array,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  whoCanSeeLocation: { type: String, required: true },
  displayFriendCount: { type: Boolean, required: true },
  whoCanSeeFriendsList: { type: String, required: true },
  whoCanSeePhoneNumber: { type: String, required: true },
  whoCanSeeEmailAddress: { type: String, required: true },
  whoCanSeeFacebook: { type: String, required: true },
  whoCanSeeX: { type: String, required: true },
  whoCanSeeInstagram: { type: String, required: true },
  whoCanSeeEventsOrganized: { type: String, required: true },
  whoCanSeeEventsInterestedIn: { type: String, required: true },
  whoCanSeeEventsInvitedTo: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
