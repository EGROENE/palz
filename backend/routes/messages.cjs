const express = require("express");

const {
  getCurrentUserMessages,
  createMessage,
} = require("../controllers/messageControllers");

const router = express.Router();

router.get("/:currentUserID", getCurrentUserMessages);
router.post("/", createMessage);

module.exports = router;
