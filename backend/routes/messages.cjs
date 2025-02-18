const express = require("express");

const {
  getCurrentUserMessages,
  createMessage,
  deleteMessage,
} = require("../controllers/messageControllers");

const router = express.Router();

router.get("/:currentUserID", getCurrentUserMessages);
router.post("/", createMessage);
router.delete("/:messageID", deleteMessage);

module.exports = router;
