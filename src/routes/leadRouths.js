const express = require("express");
const router = express.Router();
const upload = require("../lib/upload");
const { protect, authorize } = require("../lib/auth");

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



module.exports = router;
