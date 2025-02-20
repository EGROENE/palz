const express = require("express");

const {
  getCurrentUserChats,
  createChat,
  deleteChat,
  updateChat,
} = require("../controllers/messageControllers");

const router = express.Router();

router.get("/:currentUserID", getCurrentUserChats);
router.post("/", createChat);
router.delete("/:chatID", deleteChat);
router.patch("/:chatID", updateChat);

module.exports = router;
