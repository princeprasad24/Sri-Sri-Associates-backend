const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../lib/auth");
const Leave = require("../models/Leave");

router.post("/apply", protect, async (req, res) => {
  try {
    const { type, reason } = req.body;

    if (!type || !reason) {
      return res
        .status(400)
        .json({ message: "Please provide leave type and reason" });
    }

    const leave = await Leave.create({
      user: req.user.id,
      type,
      reason,
      status: "Pending",
    });

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/my-leaves", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort("-createdAt");
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

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

router.patch(
  "/admin/status/:id",
  protect,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const leave = await Leave.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true },
      );
      res.json({ success: true, data: leave });
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  },
);

module.exports = router;
