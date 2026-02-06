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
  upload.array("documents", 5), // Allows up to 5 files during edit
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


// router.get(
//   "/download",
//   protect,
//   authorize("ADMIN", "CLIENT"),
//   async (req, res) => {
//     try {
//       const { url, name } = req.query;
//       if (!url) return res.status(400).json({ message: "File URL missing" });

//       const response = await axios.get(url, { responseType: "stream" });

//       const safeName = name ? path.basename(name) : "document";
//       res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
//       res.setHeader("Content-Type", response.headers["content-type"]);
//       if (response.headers["content-length"]) {
//         res.setHeader("Content-Length", response.headers["content-length"]);
//       }

//       response.data.pipe(res).on("error", (err) => {
//         console.error("STREAM ERROR:", err.message);
//         res.status(500).end("Download failed");
//       });
//       console.log(`File download started: ${safeName}`);
//     } catch (err) {
//       console.error("DOWNLOAD ERROR:", err.message);

//       res.status(500).json({ message: "Download failed" });
//     }
//   }
// );

// GET /leads/:leadId/download?docId=xxx


router.get("/leads/:leadId/download", protect, authorize("ADMIN", "CLIENT"), async (req, res) => {
  const { leadId } = req.params;
  const { docId } = req.query;

  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  if (req.user.role !== "ADMIN" && lead.client.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const document = lead.documents.find(d => d._id.toString() === docId);
  if (!document) return res.status(404).json({ message: "Document not found" });

  res.redirect(document.url); // <-- simplest way to download via server
});



// 3. PLACE PARAMETER ROUTES LAST
router.get("/:id", protect, authorize("ADMIN", "CLIENT"), getLeadById);
router.put("/:id", protect, authorize("CLIENT"), upload.array("documents", 5), updateLead);
router.patch("/:id/status", protect, authorize("ADMIN"), updateLeadStatus);
router.delete("/:id", protect, authorize("CLIENT"), deleteLead);

module.exports = router;
