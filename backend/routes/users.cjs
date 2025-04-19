const express = require("express");

// Import handlers:
const {
  createNewUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} = require("../controllers/userControllers.js");

const router = express.Router();

// GET all users
router.get("/", getAllUsers);

// GET single user:
router.get("/:id", getUser);

// POST new user:
router.post("/signup", createNewUser);

// login existing user
router.post("/login", loginUser);

// DELETE a user:
router.delete("/:id", deleteUser);

// PATCH a user:
router.patch("/:id", updateUser);

module.exports = router;
