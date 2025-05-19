const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createAnalysis,
  getAnalysis,
  getUserAnalyses,
} = require("../controllers/analysisController");
const upload = require("../middleware/uploadMiddleware");
const Gpt4oAnalysis = require("../models/gpt4oAnalysis");
const Analysis = require("../models/analysis");
const checkSubscription = require("../middleware/checkSubscription");

// 创建分析
router.post(
  "/",
  protect,
  checkSubscription("gpt4oResumeAnalysis"),
  createAnalysis
);

// 获取分析详情
router.get("/:id", protect, getAnalysis);

// 获取用户所有分析
router.get("/", protect, getUserAnalyses);

module.exports = router;
