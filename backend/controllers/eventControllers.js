const mongoose = require("mongoose");

const Event = require("../models/eventModel");

const User = require("../models/userModel");

const getAllEvents = async (req, res) => {
  const allEvents = await Event.find({});

  res.status(200).json(allEvents);
};

const getEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Bad request (invalid id)" });
  }

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({ error: "Event doesn't exist" });
  }

  res.status(200).json(event);
};

const createNewEvent = async (req, res) => {
  const {
    index,
    title,
    organizers,
    invitees,
    blockedUsersEvent,
    description,
    additionalInfo,
    city,
    stateProvince,
    country,
    publicity,
    eventEndDateMidnightUTCInMS,
    eventEndTimeAfterMidnightUTCInMS,
    eventEndDateTimeInMS,
    eventStartDateMidnightUTCInMS,
    eventStartTimeAfterMidnightUTCInMS,
    eventStartDateTimeInMS,
    creator,
    interestedUsers,
    images,
    relatedInterests,
    address,
    maxParticipants,
  } = req.body;

  try {
    const event = await Event.create({
      index,
      title,
      organizers,
      invitees,
      blockedUsersEvent,
      description,
      additionalInfo,
      city,
      stateProvince,
      country,
      publicity,
      eventEndDateMidnightUTCInMS,
      eventEndTimeAfterMidnightUTCInMS,
      eventEndDateTimeInMS,
      eventStartDateMidnightUTCInMS,
      eventStartTimeAfterMidnightUTCInMS,
      eventStartDateTimeInMS,
      creator,
      interestedUsers,
      images,
      relatedInterests,
      address,
      maxParticipants,
    });
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Bad request (invalid id)" });
  }

  const event = await Event.findOneAndDelete({ _id: id });

  if (!event) {
    return res.status(400).json({ error: "Event doesn't exist" });
  }

  res.status(200).json(event);
};

const updateEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Bad request (invalid id)" });
  }

  const event = await Event.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

  if (!event) {
    return res.status(400).json({ error: "Event doesn't exist" });
  }

  res.status(200).json(event);
};

const getUpcomingEventsUserRSVPdTo = async (req, res) => {
  const { username } = req.params;

  const otherUser = await User.findOne({ username });

  const now = Date.now();

  const events = await Event.find({
    eventStartDateTimeInMS: { $gt: now },
    eventEndDateTimeInMS: { $gt: now },
    interestedUsers: { $in: otherUser._id.toString() },
  });

  res.status(200).json(events);
};

const getOngoingEvents = async (req, res) => {
  const { username } = req.params;

  const otherUser = await User.findOne({ username });

  const now = Date.now();

  const events = await Event.find({
    eventStartDateTimeInMS: { $gte: now },
    eventEndDateTimeInMS: { $lt: now },
    $or: [
      { organizers: { $in: otherUser._id.toString() } },
      { interestedUsers: { $in: otherUser._id.toString() } },
    ],
  });

  res.status(200).json(events);
};

const getUpcomingEventsUserOrganizes = async (req, res) => {
  const { username } = req.params;

  const otherUser = await User.findOne({ username });

  const now = Date.now();

  const events = await Event.find({
    eventStartDateTimeInMS: { $gt: now },
    eventEndDateTimeInMS: { $gt: now },
    organizers: { $in: otherUser._id.toString() },
  });

  res.status(200).json(events);
};

const getUpcomingEventsUserInvitedTo = async (req, res) => {
  const { username } = req.params;

  const otherUser = await User.findOne({ username });

  const now = Date.now();

  const events = await Event.find({
    eventStartDateTimeInMS: { $gt: now },
    eventEndDateTimeInMS: { $gt: now },
    invitees: { $in: otherUser._id.toString() },
  });

  res.status(200).json(events);
};

const getRecentEventsUserRSVPdTo = async (req, res) => {
  const { username } = req.params;

  const otherUser = await User.findOne({ username });

  const now = Date.now();

  const thirtyoneDaysInMs = 1000 * 60 * 60 * 24 * 31;

  const events = await Event.find({
    eventEndDateTimeInMS: { $lte: now - thirtyoneDaysInMs },
    interestedUsers: { $in: otherUser._id.toString() },
  });

  res.status(200).json(events);
};

const getEventsUserCreated = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  const events = await Event.find({
    organizers: { $in: user._id.toString() },
  });

  res.status(200).json(events);
};

const getRecentEventsUserOrganized = async (req, res) => {
  const { username } = req.params;

  const otherUser = await User.findOne({ username });

  const now = Date.now();

  const thirtyoneDaysInMs = 1000 * 60 * 60 * 24 * 31;

  const events = await Event.find({
    eventEndDateTimeInMS: { $lte: now - thirtyoneDaysInMs },
    organizers: { $in: otherUser._id.toString() },
  });

  res.status(200).json(events);
};

const getCurrentUserUpcomingEvents = async (req, res) => {
  const { username } = req.params;

  const currentUser = await User.findOne({ username });

  const events = await Event.find({
    $or: [
      { organizers: { $in: currentUser._id.toString() } },
      { invitees: { $in: currentUser._id.toString() } },
      { interestedUsers: { $in: currentUser._id.toString() } },
    ],
  });

  res.status(200).json(events);
};

const getPotentialEventCOsController = async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  const potentialCOs = await User.find({
    index: { $gte: Number(start) },
    _id: { $ne: currentUser._id.toString() },
    "blockedUsers._id": { $ne: currentUser._id.toString() },
    "blockedBy._id": { $ne: currentUser._id.toString() },
    profileVisibleTo: { $ne: "nobody" },
    whoCanAddUserAsOrganizer: { $ne: "nobody" },
  }).limit(Number(limit));

  res.status(200).json(potentialCOs);
};

const getPotentialInviteesController = async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  const potentialInvitees = await User.find({
    index: { $gte: Number(start) },
    _id: { $ne: currentUser._id.toString() },
    "blockedUsers._id": { $ne: currentUser._id.toString() },
    "blockedBy._id": { $ne: currentUser._id.toString() },
    profileVisibleTo: { $ne: "nobody" },
    whoCanInviteUser: { $ne: "nobody" },
  }).limit(Number(limit));

  res.status(200).json(potentialInvitees);
};

const getPotentialEventBlockeesController = async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  // Should be able to block anyone from event who isn't currentUser and who hasn't blocked currentUser
  const potentialBlockees = await User.find({
    index: { $gte: Number(start) },
    _id: { $ne: currentUser._id.toString() },
  }).limit(Number(limit));

  res.status(200).json(potentialBlockees);
};

module.exports = {
  getPotentialEventCOsController,
  getPotentialInviteesController,
  getPotentialEventBlockeesController,
  getCurrentUserUpcomingEvents,
  getUpcomingEventsUserRSVPdTo,
  getOngoingEvents,
  getUpcomingEventsUserOrganizes,
  getUpcomingEventsUserInvitedTo,
  getRecentEventsUserRSVPdTo,
  getEventsUserCreated,
  getRecentEventsUserOrganized,
  createNewEvent,
  getAllEvents,
  getEvent,
  deleteEvent,
  updateEvent,
};
