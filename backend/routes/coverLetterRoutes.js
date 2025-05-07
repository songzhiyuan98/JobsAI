const express = require("express");
const router = express.Router();
const coverLetterController = require("../controllers/coverLetterController");
const { protect } = require("../middleware/auth");

router.post("/", protect, coverLetterController.createCoverLetter);
router.get("/:id", protect, coverLetterController.getCoverLetter);
router.get("/", protect, coverLetterController.getUserCoverLetters);
router.get("/:id/download", protect, coverLetterController.downloadPdf);

module.exports = router;
