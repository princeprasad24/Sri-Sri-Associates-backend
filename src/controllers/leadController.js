const Lead = require("../models/Leads");

// Helper to check if required fields are present based on Loan Type
const checkCompletion = (loanType, core, details) => {
  // Check core required fields
  if (!core.customerName || !core.mobileNumber || !core.loanAmount) return false;
  
  // Ensure details exists to avoid crashes
  const d = details || {};

  switch (loanType) {
    case "Home Loan": 
    case "LAP Loan":
      return !!(d.sqFt && d.area && d.houseValue);
    case "Personal Loan":
      return !!(d.income && d.residence);
    case "Business Loan":
      return !!(d.income && d.businessType);
    case "Vehicle Loan":
      return !!(d.vehicleType && d.vehicleModel);
    default: 
      return false;
  }
};

/**
 * CREATE LEAD
 */
exports.createLead = async (req, res) => {
  try {
    const { customerName, mobileNumber, loanType, loanAmount, ...loanDetails } = req.body;
    
    const isFinished = checkCompletion(loanType, { customerName, mobileNumber, loanAmount }, loanDetails);

    const lead = await Lead.create({
      client: req.user.id,
      customerName, 
      mobileNumber, 
      loanType, 
      loanAmount: Number(loanAmount) || 0,
      loanDetails, 
      isFinished,
      documents: req.files ? req.files.map(f => ({ fileName: f.originalname, url: f.path })) : []
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

/**
 * UPDATE LEAD (Used for Client Editing)
 */
exports.updateLead = async (req, res) => {
  try {
    const { customerName, mobileNumber, loanAmount, ...loanDetails } = req.body;
    const existing = await Lead.findById(req.params.id);
    
    if (!existing) return res.status(404).json({ success: false, message: "Lead not found" });

    // Handle Document Logic
    let updatedDocs = existing.documents;
    if (req.files && req.files.length > 0) {
      // If you want to replace old files, use: req.files.map(...)
      // If you want to append, use: [...existing.documents, ...newDocs]
      updatedDocs = req.files.map(f => ({ fileName: f.originalname, url: f.path }));
    }

    const isFinished = checkCompletion(
      existing.loanType, 
      { customerName, mobileNumber, loanAmount }, 
      loanDetails
    );

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { 
        customerName, 
        mobileNumber, 
        loanAmount, 
        loanDetails, 
        isFinished,
        documents: updatedDocs 
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

/**
 * ADMIN - GET ALL LEADS
 */
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate("client", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

/**
 * CLIENT - GET OWN LEADS
 */
exports.getClientLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ client: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

/**
 * GET SINGLE LEAD BY ID
 */
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("client", "name email");
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.status(200).json({ success: true, data: lead });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

/**
 * UPDATE STATUS (ADMIN ONLY)
 */
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, data: lead });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};


// DELETE LEAD
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, client: req.user.id });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.status(200).json({ success: true, message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};