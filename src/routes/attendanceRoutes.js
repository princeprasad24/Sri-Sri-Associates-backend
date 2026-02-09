const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../lib/auth");
const Attendance = require("../models/Attendance");


// Check today's status
router.get("/today", protect, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const record = await Attendance.findOne({ user: req.user.id, date: today });
  res.json({ record });
});

// Punch In
router.post("/punch-in", protect, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  
  let record = await Attendance.findOne({ user: req.user.id, date: today });
  if (record) return res.status(400).json({ message: "Already punched in today" });

  record = await Attendance.create({
    user: req.user.id,
    date: today,
    punchIn: new Date(),
    status: "IN"
  });

  res.status(201).json({ message: "Punched in", time: record.punchIn });
});

// Punch Out
router.post("/punch-out", protect, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const record = await Attendance.findOneAndUpdate(
    { user: req.user.id, date: today, status: "IN" },
    { punchOut: new Date(), status: "OUT" },
    { new: true }
  );

  if (!record) return res.status(400).json({ message: "No active punch-in found for today" });
  res.json({ message: "Punched out", time: record.punchOut });
});

router.get("/admin/today-logs", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const logs = await Attendance.find({ date: today })
      .populate("user", "name email")
      .sort("-punchIn"); // Latest punch-ins first

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/client/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const history = await Attendance.find({ user: req.params.id }).sort("-date");
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;