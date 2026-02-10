const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, 
    required: true,
  },
  punchIn: {
    type: Date,
    required: true,
  },
  punchOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["IN", "OUT"],
    default: "IN",
  },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);