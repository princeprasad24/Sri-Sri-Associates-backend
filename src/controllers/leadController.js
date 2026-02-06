const Lead = require("../models/Leads");

/**
 * Helper: Check if required fields are present based on Loan Type
 */
const checkCompletion = (loanType, core, details = {}) => {
  if (!core.customerName || !core.mobileNumber || !core.loanAmount)
    return false;

  switch (loanType) {
    case "Home Loan":
    case "LAP Loan":
      return !!(details.sqFt && details.area && details.houseValue);

    case "Personal Loan":
      return !!(details.income && details.residence);

    case "Business Loan":
      return !!(details.income && details.itr_gst);

    case "Vehicle Loan":
      return !!(details.vehicleType && details.vehicleModel);

    default:
      return false;
  }
};

/**
 * CREATE LEAD
 */

// exports.createLead = async (req, res) => {
//   try {
//     console.log("REQ BODY:", req.body);
//     console.log("REQ FILES:", req.files);
//     const {
//       customerName,
//       mobileNumber,
//       loanAmount,
//       loanType,
//       ...loanDetails
//     } = req.body;

//     const documents = req.files
//       ? req.files.map((file) => ({
//           name: file.originalname,
//           url: file.path,
//           publicId: file.filename,
//           uploadedAt: new Date(),
//         }))
//       : [];
//       console.log("Parsed Documents:", documents);
//     const isFinished = checkCompletion(
//       loanType,
//       { customerName, mobileNumber, loanAmount },
//       loanDetails
//     );

//     const newLead = await Lead.create({
//       client: req.user.id,
//       customerName,
//       mobileNumber,
//       loanAmount,
//       loanType,
//       loanDetails,
//       documents,
//       isFinished,
//       status: "Pending",
//     });

//     res.status(201).json({
//       success: true,
//       data: newLead,
//     });
//   } catch (err) {
//     console.error("Create Lead Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


/**
 * CREATE LEAD
 */
exports.createLead = async (req, res) => {
  try {
    const {
      customerName,
      mobileNumber,
      loanAmount,
      loanType,
      ...loanDetails
    } = req.body;

    // Map uploaded files to Cloudinary info
    const documents = req.files
      ? req.files.map((file) => ({
          name: file.originalname,
          url: file.path || file.secure_url, // Cloudinary URL
          publicId: file.filename || file.public_id, // Cloudinary public_id
          uploadedAt: new Date(),
        }))
      : [];

    // Check if lead is complete
    const isFinished = checkCompletion(
      loanType,
      { customerName, mobileNumber, loanAmount },
      loanDetails
    );

    const newLead = await Lead.create({
      client: req.user.id,
      customerName,
      mobileNumber,
      loanAmount,
      loanType,
      loanDetails,
      documents,
      isFinished,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      data: newLead,
    });
  } catch (err) {
    console.error("Create Lead Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// /**
//  * UPDATE LEAD (CLIENT)
//  */

// exports.updateLead = async (req, res) => {
//   try {
//     const leadId = req.params.id;
//     const updates = req.body;

//     const existing = await Lead.findById(leadId);
//     if (!existing) {
//       return res.status(404).json({ success: false, message: "Lead not found" });
//     }

//     // Core fields
//     const core = {
//       customerName: updates.customerName ?? existing.customerName,
//       mobileNumber: updates.mobileNumber ?? existing.mobileNumber,
//       loanAmount: updates.loanAmount ?? existing.loanAmount,
//     };

//     const loanType = updates.loanType || existing.loanType;

//     const existingLoanDetails = existing.loanDetails
//       ? existing.loanDetails.toObject()
//       : {};

//     const {
//       customerName,
//       mobileNumber,
//       loanAmount,
//       loanType: _ignore,
//       ...loanDetailUpdates
//     } = updates;

//     const mergedLoanDetails = {
//       ...existingLoanDetails,
//       ...loanDetailUpdates,
//     };

//     // Documents
//     let mergedDocuments = existing.documents || [];
//     if (req.files?.length) {
//       mergedDocuments = [
//         ...mergedDocuments,
//         ...req.files.map((f) => ({
//           name: f.originalname,
//           url: f.path,
//           publicId: f.filename,
//           uploadedAt: new Date(),
//         })),
//       ];
//     }

//     const isFinished = checkCompletion(loanType, core, mergedLoanDetails);

//     const updatedLead = await Lead.findByIdAndUpdate(
//       leadId,
//       {
//         customerName: core.customerName,
//         mobileNumber: core.mobileNumber,
//         loanAmount: core.loanAmount,
//         loanType,
//         loanDetails: mergedLoanDetails,
//         documents: mergedDocuments,
//         isFinished,
//       },
//       { new: true }
//     );

//     res.status(200).json({ success: true, data: updatedLead });
//   } catch (err) {
//     console.error("UPDATE LEAD ERROR:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

/**
 * UPDATE LEAD (CLIENT)
 */
exports.updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const updates = req.body;

    const existing = await Lead.findById(leadId);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Core fields
    const core = {
      customerName: updates.customerName ?? existing.customerName,
      mobileNumber: updates.mobileNumber ?? existing.mobileNumber,
      loanAmount: updates.loanAmount ?? existing.loanAmount,
    };

    const loanType = updates.loanType || existing.loanType;

    const existingLoanDetails = existing.loanDetails
      ? existing.loanDetails.toObject()
      : {};

    const {
      customerName,
      mobileNumber,
      loanAmount,
      loanType: _ignore,
      ...loanDetailUpdates
    } = updates;

    const mergedLoanDetails = {
      ...existingLoanDetails,
      ...loanDetailUpdates,
    };

    // Merge existing documents with newly uploaded Cloudinary documents
    let mergedDocuments = existing.documents || [];
    if (req.files?.length) {
      mergedDocuments = [
        ...mergedDocuments,
        ...req.files.map((file) => ({
          name: file.originalname,
          url: file.path || file.secure_url,
          publicId: file.filename || file.public_id,
          uploadedAt: new Date(),
        })),
      ];
    }
    console.log(req.file.secure_url)

    const isFinished = checkCompletion(loanType, core, mergedLoanDetails);

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      {
        customerName: core.customerName,
        mobileNumber: core.mobileNumber,
        loanAmount: core.loanAmount,
        loanType,
        loanDetails: mergedLoanDetails,
        documents: mergedDocuments,
        isFinished,
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedLead });
  } catch (err) {
    console.error("UPDATE LEAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




/**
 * ADMIN - GET ALL LEADS
 */
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("client", "name email")
      .sort({ createdAt: -1 });

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
    const leads = await Lead.find({ client: req.user.id }).sort({
      createdAt: -1,
    });

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
    const lead = await Lead.findById(req.params.id).populate(
      "client",
      "name email",
    );

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

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
      { new: true },
    );

    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE LEAD (CLIENT)
 */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      client: req.user.id,
    });

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
