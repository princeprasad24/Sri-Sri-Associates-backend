const express = require("express");
const { protect, authorize } = require("../lib/auth");
const User = require("../models/User");

const router = express.Router();

// GET all clients - ADMIN only
router.get("/clients", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const clients = await User.find({ role: "CLIENT" }).select("-password -__v");
    res.status(200).json({ data: clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
