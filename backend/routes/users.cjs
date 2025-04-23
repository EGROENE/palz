const express = require("express");

// Import handlers:
const {
  createNewUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  getUserByUsernameOrEmailAddress,
} = require("../controllers/userControllers.js");

const router = express.Router();

// GET all users
router.get("/", getAllUsers);

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
