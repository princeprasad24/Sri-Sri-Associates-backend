const express = require("express");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

router.get("/:publicId", (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);

    if (!publicId) {
      return res.status(400).json({ error: "Missing publicId" });
    }

    const isRaw = publicId.match(/\.(doc|docx|xls|xlsx|zip|rar)$/i);
    const resourceType = isRaw ? "raw" : "image";

    const downloadUrl = cloudinary.url(publicId, {
      resource_type: resourceType, 
      flags: "attachment",         
      secure: true,
      sign_url: false              
    });

    console.log("Generated Valid URL:", downloadUrl);
    return res.json({ url: downloadUrl });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

module.exports = router;