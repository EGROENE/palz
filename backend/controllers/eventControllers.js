const mongoose = require("mongoose");

const Event = require("../models/eventModel");

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
    title,
    organizers,
    invitees,
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
    imageOne,
    imageTwo,
    imageThree,
    relatedInterests,
    address,
    maxParticipants,
  } = req.body;

  try {
    const event = await Event.create({
      title,
      organizers,
      invitees,
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
      imageOne,
      imageTwo,
      imageThree,
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

module.exports = {
  createNewEvent,
  getAllEvents,
  getEvent,
  deleteEvent,
  updateEvent,
};
