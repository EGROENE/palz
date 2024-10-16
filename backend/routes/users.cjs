const express = require("express");

// Import handlers:
const {
  createNewUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} = require("../controllers/userControllers");

const router = express.Router();

// GET all users
router.get("/", getAllUsers);

// GET single user:
router.get("/:id", getUser);

// POST new user:
router.post("/", createNewUser);

// DELETE a user:
router.delete("/:id", deleteUser);

// PATCH a user:
router.patch("/:id", updateUser);

module.exports = router;
