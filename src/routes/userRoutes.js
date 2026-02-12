const express = require("express");
const { protect, authorize } = require("../lib/auth");
const User = require("../models/User");
const { 
  getAllClients, 
  toggleUserStatus, 
  deleteClient 
} = require("../controllers/userController");
const router = express.Router();

// GET all clients - ADMIN only
router.get("/clients", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const clients = await User.find({ role: "CLIENT" }).select(
      "-password -__v",
    );
    res.status(200).json({ data: clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/pending", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: "CLIENT",
      isApproved: false,
    }).select("-password -__v");
    res.status(200).json({ data: pendingUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put("/approve/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    );
    res
      .status(200)
      .json({ message: `${user.name} approved successfully`, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put("/reject/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isApproved && user.role !== "CLIENT") {
      return res
        .status(400)
        .json({
          message: "Cannot reject an already approved Admin/Staff member",
        });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Registration request for ${user.name} has been rejected and removed.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/attendance-logs", protect, authorize("ADMIN"), async (req, res) => {
  const logs = await Attendance.find().populate("user", "name email").sort("-createdAt");
  res.json({ data: logs });
});

router.delete("/:id", protect, authorize("ADMIN"), deleteClient);

module.exports = router;
