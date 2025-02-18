const express = require("express");

const { getCurrentUserMessages } = require("../controllers/messageControllers");

const router = express.Router();

router.get("/:currentUserID", getCurrentUserMessages);

module.exports = router;
