const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inviteeOrganizerSchema = new Schema({
  _id: String | mongoose.Types.ObjectId,
  username: String,
  firstName: String,
  lastName: String,
  profileImage: String,
  emailAddress: String,
  index: Number,
});

const eventSchema = new Schema({
  index: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  organizers: {
    type: [String],
    required: true,
  },
  invitees: {
    type: [String],
    required: true,
  },
  blockedUsersEvent: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  additionalInfo: {
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
  publicity: {
    type: String,
    required: true,
  },
  eventEndDateMidnightUTCInMS: {
    type: Number,
    required: true,
  },
  eventEndTimeAfterMidnightUTCInMS: {
    type: Number,
    required: true,
  },
  eventEndDateTimeInMS: {
    type: Number,
    required: true,
  },
  eventStartDateMidnightUTCInMS: {
    type: Number,
    required: true,
  },
  eventStartTimeAfterMidnightUTCInMS: {
    type: Number,
    required: true,
  },
  eventStartDateTimeInMS: {
    type: Number,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  interestedUsers: {
    type: [inviteeOrganizerSchema],
    required: true,
  },
  disinterestedUsers: {
    type: [inviteeOrganizerSchema],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  relatedInterests: {
    type: [String],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  maxParticipants: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

module.exports = mongoose.model("Event", eventSchema);
