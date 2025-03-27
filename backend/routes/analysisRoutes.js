const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createAnalysis,
  getAnalysis,
  getUserAnalyses,
} = require("../controllers/analysisController");

// 创建分析
router.post("/", protect, createAnalysis);

// 获取分析详情
router.get("/:id", protect, getAnalysis);

// 获取用户所有分析
router.get("/", protect, getUserAnalyses);

module.exports = router;
