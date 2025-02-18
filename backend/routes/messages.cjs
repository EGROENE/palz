const express = require("express");

const {
  getCurrentUserMessages,
  createMessage,
  deleteMessage,
  updateMessage,
} = require("../controllers/messageControllers");

const router = express.Router();

router.get("/:currentUserID", getCurrentUserMessages);
router.post("/", createMessage);
router.delete("/:messageID", deleteMessage);
router.patch("/:messageID", updateMessage);

module.exports = router;
