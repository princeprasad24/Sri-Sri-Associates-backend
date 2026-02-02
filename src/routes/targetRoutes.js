const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../lib/auth");
const { setTarget, getTargetProgress } = require('../controllers/targetController');

router.post('/set', protect, authorize('ADMIN'), setTarget);
router.get('/progress', protect, getTargetProgress); 

module.exports = router;