const express = require("express");
const { createMessage, getMessages } = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, adminOnly, getMessages);

module.exports = router;
