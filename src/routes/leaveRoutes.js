const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../lib/auth");
const Leave = require("../models/Leave");

// @route   POST /api/leaves/apply
// @desc    Client applies for leave
// @access  Private (CLIENT)
router.post("/apply", protect, async (req, res) => {
  try {
    const { type, reason } = req.body;

    if (!type || !reason) {
      return res.status(400).json({ message: "Please provide leave type and reason" });
    }

    const leave = await Leave.create({
      user: req.user.id,
      type,
      reason,
      status: "Pending"
    });

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// @route   GET /api/leaves/my-leaves
// @desc    Get logged in client's leave history
// @access  Private (CLIENT)
router.get("/my-leaves", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort("-createdAt");
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/leaves/admin/all
// @desc    Admin view all pending/past leaves
// @access  Private (ADMIN)
router.get("/admin/all", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("user", "name email")
      .sort("-createdAt");
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PATCH /api/leaves/admin/status/:id
// @desc    Admin Approve or Reject leave
// @access  Private (ADMIN)
router.patch("/admin/status/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const { status } = req.body; // Approved or Rejected
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});



module.exports = router;