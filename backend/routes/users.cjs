const express = require("express");

// Import handlers:
const {
  createNewUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  getUserByUsernameOrEmailAddress,
  getUserByUsernamePhoneNumberOrEmailAddress,
} = require("../controllers/userControllers.js");

const router = express.Router();

// GET all users
router.get("/", getAllUsers);

router.get("/add-event", getAllUsers);

router.get("/edit-event", getAllUsers);

// Used to check if username, email, phone number are unique when saving Settings form
router.post("/settings", getUserByUsernamePhoneNumberOrEmailAddress);

// Get single user by username or email (used to set currentUser when user logs in):
// Is post request, since GET cannot have a request body
router.post("/login", getUserByUsernameOrEmailAddress);

// GET single user by ID:
router.get("/:id", getUser);

// POST new user:
router.post("/signup", createNewUser);

// DELETE a user:
router.delete("/:id", deleteUser);

// PATCH a user:
router.patch("/:id", updateUser);

module.exports = router;
