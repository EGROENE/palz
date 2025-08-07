const express = require("express");

// Import handlers:
const {
  createNewEvent,
  getAllEvents,
  getEvent,
  deleteEvent,
  updateEvent,
  getUpcomingEventsUserRSVPdTo,
  getOngoingEvents,
  getUpcomingEventsUserOrganizes,
  getUpcomingEventsUserInvitedTo,
  getRecentEventsUserRSVPdTo,
  getEventsUserCreated,
  getRecentEventsUserOrganized,
  getCurrentUserUpcomingEvents,
} = require("../controllers/eventControllers");

const router = express.Router();

// GET all events:
router.get("/", getAllEvents);

// GET single event:
router.get("/:id", getEvent);

// POST new event:
router.post("/", createNewEvent);

// DELETE an event:
router.delete("/:id", deleteEvent);

// PATCH an event:
router.patch("/:id", updateEvent);

router.use("/userUpcomingEvents/:username", getCurrentUserUpcomingEvents);

router.use("/userEvents/:username", (req, res) => {
  const { eventsType } = req.query;

  if (eventsType === "upcomingEventsUserRSVPdTo") {
    return getUpcomingEventsUserRSVPdTo(req, res);
  }

  if (eventsType === "ongoingEvents") {
    return getOngoingEvents(req, res);
  }

  if (eventsType === "upcomingEventsUserOrganizes") {
    return getUpcomingEventsUserOrganizes(req, res);
  }

  if (eventsType === "upcomingEventsUserInvitedTo") {
    return getUpcomingEventsUserInvitedTo(req, res);
  }

  if (eventsType === "recentEventsUserRSVPdTo") {
    return getRecentEventsUserRSVPdTo(req, res);
  }

  if (eventsType === "recentEventsUserOrganized") {
    return getRecentEventsUserOrganized(req, res);
  }

  if (eventsType === "eventsUserCreated") {
    return getEventsUserCreated(req, res);
  }
});

module.exports = router;
