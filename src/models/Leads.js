const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    loanType: {
      type: String,
      required: true,
      enum: [
        "Home Loan",
        "Personal Loan",
        "Business Loan",
        "LAP Loan",
        "Vehicle Loan",
        "Vehicle Insurance",
        "Other Loan Types"
      ],
    },
    loanAmount: { type: Number, default: 0 },
    status: {
      type: String,
      default: "NEW LEAD",
      enum: ["Pending", "NEW LEAD", "Approved", "Disbursed", "Rejected"],
      default: "Pending",
    },
    loanDetails: { type: Map, of: String, default: {} },
    documents: [
      {
        fileName: { type: String },
        docType: { type: String },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isFinished: { type: Boolean, default: false }, 
    remarks: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lead", leadSchema);
