const express = require("express");

const {
  getPotentialChatMembers,
  getCurrentUserChats,
  createChat,
  deleteChat,
  updateChat,
} = require("../controllers/chatControllers");

const router = express.Router();

router.get("/:currentUserID", getCurrentUserChats);
router.get("/", getPotentialChatMembers);
router.post("/", createChat);
router.delete("/:chatID", deleteChat);
router.patch("/:chatID", updateChat);

module.exports = router;
