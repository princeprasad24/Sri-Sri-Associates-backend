const Target = require("../models/Target");
const Lead = require("../models/Leads");

exports.setTarget = async (req, res) => {
  try {
    const target = await Target.findOneAndUpdate(
      {
        client: req.body.client,
        month: Number(req.body.month),
        year: Number(req.body.year),
      },
      req.body,
      { upsert: true, new: true },
    );
    res.status(200).json({ success: true, data: target });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getTargetProgress = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const clientId =
      req.user.role === "ADMIN" ? req.query.clientId : req.user.id;

    const target = await Target.findOne({ client: clientId, month, year });

    const start = new Date(year, month - 1, 1, 0, 0, 0);

    const end = new Date(year, month, 0, 23, 59, 59);

    const leads = await Lead.find({
      client: clientId,
      status: "Disbursed",
      createdAt: { $gte: start, $lte: end },
    });

    const completedAmount = leads.reduce(
      (sum, lead) => sum + (Number(lead.loanAmount) || 0),
      0,
    );

    res.status(200).json({
      success: true,
      targetAmount: target?.targetAmount || 0,
      completedAmount,
      remainingAmount: target
        ? Math.max(0, target.targetAmount - completedAmount)
        : 0,
    });
  } catch (err) {
    console.error("TARGET PROGRESS ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
