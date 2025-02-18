const express = require("express");

const { getSentMessages } = require("../controllers/messageControllers");

const router = express.Router();

router.get("/:sender", getSentMessages);

module.exports = router;
