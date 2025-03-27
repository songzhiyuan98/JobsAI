const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createInterview,
  getInterview,
  sendMessage,
  getInterviewSummary,
} = require("../controllers/interviewController");

// 创建面试
router.post("/", protect, createInterview);

// 获取面试详情
router.get("/:id", protect, getInterview);

// 发送消息
router.post("/message", protect, sendMessage);

module.exports = router;
