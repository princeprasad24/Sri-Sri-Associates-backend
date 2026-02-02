const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    loanType: { 
      type: String, 
      required: true, 
      enum: ["Home Loan", "Personal Loan", "Business Loan", "LAP Loan", "Vehicle Loan"] 
    },
    loanAmount: { type: Number, default: 0 },
    status: { 
      type: String, 
      default: "NEW LEAD", 
      enum: ["NEW LEAD", "Approved", "Disbursed", "Rejected"] 
    },
    loanDetails: { type: Map, of: String, default: {} },
    documents: [{ fileName: String, docType: String, url: String }],
    isFinished: { type: Boolean, default: false }, // Logic field
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);