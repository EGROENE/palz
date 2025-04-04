const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
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
    required: false,
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
    type: [String],
    required: true,
  },
  disinterestedUsers: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: false,
  },
  relatedInterests: {
    type: [String],
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  maxParticipants: {
    type: Schema.Types.Mixed,
    required: false,
  },
});

module.exports = mongoose.model("Event", eventSchema);
