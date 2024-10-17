const express = require("express");

// Import handlers:
const {
  createNewEvent,
  getAllEvents,
  getEvent,
  deleteEvent,
  updateEvent,
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

module.exports = router;
