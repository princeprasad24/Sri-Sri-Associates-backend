const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../lib/auth");
const {
  setTarget,
  getTargetProgress,
} = require("../controllers/targetController");
const Target = require("../models/Target");
const Leads = require("../models/Leads");

router.post("/set", protect, authorize("ADMIN"), setTarget);
router.get("/progress", protect, getTargetProgress);

router.get("/progress/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const userId = req.params.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const target = await Target.findOne({ client: userId, month, year });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const leads = await Leads.find({
      client: userId,
      status: "Disbursed",
      createdAt: { $gte: start, $lte: end },
    });

    const completedAmount = leads.reduce(
      (acc, lead) => acc + (Number(lead.loanAmount) || 0),
      0,
    );

    const monthName = now.toLocaleString("default", { month: "long" });

    res.json({
      targetAmount: target?.targetAmount || 0,
      completedAmount,
      month: monthName,
      year,
      remainingAmount: target
        ? Math.max(0, target.targetAmount - completedAmount)
        : 0,
    });
  } catch (err) {
    console.error("TARGET PROGRESS ERROR:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
