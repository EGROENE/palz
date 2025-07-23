require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");

// Express app:
const app = express();

const mongoose = require("mongoose");

const cors = require("cors");
app.use(cors());

const User = require("./models/userModel");
const Event = require("./models/eventModel");

const userRoutes = require("./routes/users.cjs");
const eventRoutes = require("./routes/events.cjs");
const chatRoutes = require("./routes/chats.cjs");

// MIDDLEWARE
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json()); // if any request has data that it sends to the server, this attaches it to request object, so we can access it in request handler

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// ROUTES
app.use("/palz/users", userRoutes);
app.use("/palz/events", eventRoutes);
app.use("/palz/chats", chatRoutes);

// Controller to get potential friends:
app.get("/palz/find-palz", async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  const potentialFriends = await User.find({
    // index is equal to or greater than 'start':
    index: { $gte: Number(start) },
    // _id isn't that of currentUser:
    _id: { $ne: currentUser._id.toString() },
    // friends doesn't contain currentUser:
    friends: { $nin: currentUser._id.toString() },
    // blockedUsers doesn't contain currentUser:
    blockedUsers: { $nin: currentUser._id.toString() },
    // blockedBy doesn't contain currentUser:
    blockedBy: { $nin: currentUser._id.toString() },
    // profileVisibleTo isn't set to 'nobody':
    profileVisibleTo: { $ne: "nobody" },
    // user doesn't have FR from currentUser:
    friendRequestsReceived: { $nin: currentUser._id.toString() },
  }).limit(Number(limit));

  res.status(200).json(potentialFriends);
});

// Controller to get friends:
app.get("/palz/my-palz", async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  const friends = await User.find({
    index: { $gte: Number(start) },
    _id: { $ne: currentUser._id.toString() },
    friends: { $in: currentUser._id.toString() },
    // blockedUsers doesn't contain currentUser:
    blockedUsers: { $nin: currentUser._id.toString() },
    // blockedBy doesn't contain currentUser:
    blockedBy: { $nin: currentUser._id.toString() },
  }).limit(Number(limit));

  res.status(200).json(friends);
});

// Controller to get displayable events:
app.get("/palz/find-events", async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });
  const now = Date.now();

  const events = await Event.find({
    // Get events w/ index greater than or equal to start:
    index: { $gte: Number(start) },
    // Get events that are either public or include currentUser as an organizer or invitee:
    $or: [{ publicity: "public" }, { invitees: { $in: currentUser._id.toString() } }],
    // Get events from which currentUser is not explicitly blocked:
    // Will need to make TEventInviteeOrOrganizer out of currentUser to check if blockedUsersEvent contains it
    "blockedUsersEvent._id": { $ne: currentUser._id.toString() },
    // Get events whose start or end time is later than the present moment:
    $or: [
      { eventStartDateTimeInMS: { $gt: now } },
      { eventEndDateTimeInMS: { $gt: now } },
    ],
  }).limit(Number(limit));

  res.status(200).json(events);
});

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

app.get("/palz/edit-event/:id", (req, res) => {
  const { list } = req.query;

  if (list === "potentialEventBlockees") {
    return getPotentialEventBlockeesController(req, res);
  } else if (list === "potentialInvitees") {
    return getPotentialInviteesController(req, res);
  }
  return getPotentialEventCOsController(req, res);
});

app.get("/palz/add-event/", (req, res) => {
  const { list } = req.query;

  if (list === "potentialEventBlockees") {
    return getPotentialEventBlockeesController(req, res);
  } else if (list === "potentialInvitees") {
    return getPotentialInviteesController(req, res);
  }
  return getPotentialEventCOsController(req, res);
});

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
      { invitees: { $in: otherUser._id.toString() } },
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

  const thirtyDaysInMs = 1000 * 60 * 60 * 24 * 30;

  const events = await Event.find({
    eventEndDateTimeInMS: { $lte: now - thirtyDaysInMs },
    interestedUsers: { $in: otherUser._id.toString() },
  });

  res.status(200).json(events);
};

app.get("/palz/otherUsers/:username", (req, res) => {
  const { eventsType } = req.query;

  if (eventsType === "upcomingEventsUserRSVPdTo") {
    return getUpcomingEventsUserRSVPdTo(req, res);
  }

  if (eventsType === "ongoingEvents") {
    return getOngoingEvents(req, res);
  }

  if (eventType === "upcomingEventsUserOrganizes") {
    return getUpcomingEventsUserOrganizes(req, res);
  }

  if (eventType === "upcomingEventsUserInvitedTo") {
    return getUpcomingEventsUserInvitedTo(req, res);
  }

  if (eventType === "recentEventsUserRSVPdTo") {
    return getRecentEventsUserRSVPdTo(req, res);
  }
});

// Connect to Mongoose:
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    // Listen for requests only after connecting to DB
    app.listen(process.env.PORT, () => {
      console.log(`Connected to DB & listening on port ${process.env.PORT}!`);
    });
  })
  .catch((error) => console.log(error));
