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
    return res.status(400).json({ error: "1Bad request (invalid id)" });
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
    return res.status(400).json({ error: "2Bad request (invalid id)" });
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
    return res.status(400).json({ error: "3Bad request (invalid id)" });
  }

  const event = await Event.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

  if (!event) {
    return res.status(404).json({ error: "Event doesn't exist" });
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

// Implement start, limit
const getEventInvitees = async (req, res) => {
  const { eventId } = req.params;
  const { start, limit } = req.query;

  try {
    const event = await Event.findById(eventId).populate("invitees");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const invitees = await User.find({
      _id: { $in: event.invitees },
      index: { $gte: Number(start) },
    }).limit(limit);

    return res.status(200).json(invitees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getEventRSVPs = async (req, res) => {
  const { eventId } = req.params;
  const { start, limit } = req.query;

  try {
    const event = await Event.findById(eventId).populate("interestedUsers");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const interestedUsers = await User.find({
      _id: { $in: event.interestedUsers },
      index: { $gte: Number(start) },
    }).limit(limit);

    return res.status(200).json(interestedUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getEventDisinterestedUsers = async (req, res) => {
  const { eventId } = req.params;
  const { start, limit } = req.query;

  try {
    const event = await Event.findById(eventId).populate("disinterestedUsers");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const disinterestedUsers = await User.find({
      _id: { $in: event.disinterestedUsers },
      index: { $gte: Number(start) },
    }).limit(limit);

    return res.status(200).json(disinterestedUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getEventDisinterestedUsers,
  getEventRSVPs,
  getEventInvitees,
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
