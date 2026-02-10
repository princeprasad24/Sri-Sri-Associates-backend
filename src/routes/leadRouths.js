const express = require("express");
const router = express.Router();
const upload = require("../lib/upload");
const axios = require("axios");
const { protect, authorize } = require("../lib/auth");

const path = require("path");
const fs = require("fs");

const {
  createLead,
  updateLeadStatus,
  getClientLeads,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");
const Leads = require("../models/Leads");

/**
 * CREATE LEAD
 * Frontend calls: POST /api/leads/add
 * Uses FormData + documents[]
 */
router.post(
  "/create",
  protect,
  authorize("CLIENT"),
  upload.array("documents", 10),
  createLead,
);

/**
 * CLIENT LEADS
 */
router.get("/my-leads", protect, authorize("CLIENT"), getClientLeads);

router.put(
  "/:id",
  protect,
  authorize("CLIENT"),
  upload.array("documents", 5),
  updateLead,
);
/**
 * ADMIN – ALL LEADS
 */
router.get("/all", protect, authorize("ADMIN"), getAllLeads);

/**
 * GET SINGLE LEAD (ADMIN + CLIENT)
 */
router.get("/:id", protect, authorize("ADMIN", "CLIENT"), getLeadById);

/**
 * UPDATE STATUS (ADMIN)
 */
router.patch("/:id/status", protect, authorize("ADMIN"), updateLeadStatus);

router.delete("/:id", protect, authorize("CLIENT"), deleteLead);

router.get(
  "/leads/:leadId/download",
  protect,
  authorize("ADMIN", "CLIENT"),
  async (req, res) => {
    const { leadId } = req.params;
    const { docId } = req.query;

    const lead = await Leads.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Leads not found" });

    if (req.user.role !== "ADMIN" && lead.client.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const document = lead.documents.find((d) => d._id.toString() === docId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    res.redirect(document.url);
  },
);

router.get("/download/:id", async (req, res) => {
  const lead = await Leads.findOne({ "documents._id": req.params.id });
  const doc = lead?.documents.id(req.params.id);

  if (!doc || !doc.url) {
    return res.status(404).send("File URL is missing in the database.");
  }

  res.redirect(doc.url);
});

router.get("/client/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const userId = req.params.id;
    const leads = await Leads.find({ client: userId }).sort({ createdAt: -1 });

    res.json({ success: true, data: leads });
  } catch (err) {
    console.error("CLIENT LEADS ERROR:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put(
  "/admin-update/:id",
  protect,
  authorize("ADMIN"),
  updateLead
);


router.get("/:id", protect, authorize("ADMIN", "CLIENT"), getLeadById);
router.put(
  "/:id",
  protect,
  authorize("CLIENT"),
  upload.array("documents", 5),
  updateLead,
);
router.patch("/:id/status", protect, authorize("ADMIN"), updateLeadStatus);
router.delete("/:id", protect, authorize("CLIENT"), deleteLead);

module.exports = router;
