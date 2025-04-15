const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createAnalysis,
  getAnalysis,
  getUserAnalyses,
  getAnalysisByJob,
} = require("../controllers/analysisController");

// 创建分析
router.post("/", protect, createAnalysis);

// 获取分析详情
router.get("/:id", protect, getAnalysis);

// 获取用户所有分析
router.get("/", protect, getUserAnalyses);

// 获取职位相关的分析报告
router.get("/job/:jobId", protect, getAnalysisByJob);

module.exports = router;
