const express = require("express");
const router = express.Router();
const upload = require("../lib/upload");
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
  createLead
);

/**
 * CLIENT LEADS
 */
router.get(
  "/my-leads",
  protect,
  authorize("CLIENT"),
  getClientLeads
);

router.put(
  "/:id",
  protect,
  authorize("CLIENT"),
  upload.array("documents", 5), // Allows up to 5 files during edit
  updateLead
);



/**
 * ADMIN – ALL LEADS
 */
router.get(
  "/all",
  protect,
  authorize("ADMIN"),
  getAllLeads
);

/**
 * GET SINGLE LEAD (ADMIN + CLIENT)
 */
router.get(
  "/:id",
  protect,
  authorize("ADMIN", "CLIENT"),
  getLeadById
);

/**
 * UPDATE STATUS (ADMIN)
 */
router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  updateLeadStatus
);

router.delete("/:id", protect, authorize("CLIENT"), deleteLead);


router.get(
  "/download/:filename",
  protect,
  authorize("ADMIN", "CLIENT"),
  (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads", filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).json({ message: "Error downloading file" });
        }
      });
    } else {
      res.status(404).json({ message: "File not found on server" });
    }
  }
);



module.exports = router;
