const express = require("express");
const router = express.Router();
const coverLetterController = require("../controllers/coverLetterController");
const { protect } = require("../middleware/auth");
const CoverLetter = require("../models/CoverLetter");
const checkSubscription = require("../middleware/checkSubscription");

// 创建求职信
router.post(
  "/",
  protect,
  checkSubscription("coverLetter"),
  coverLetterController.createCoverLetter
);

// 获取单个求职信
router.get("/:id", protect, coverLetterController.getCoverLetter);

// 获取用户所有求职信
router.get("/", protect, coverLetterController.getUserCoverLetters);

// 下载求职信 PDF
router.get("/:id/download", protect, coverLetterController.downloadPdf);

// 获取用户的所有求职信
router.get("/", protect, async (req, res) => {
  try {
    const coverLetters = await CoverLetter.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-__v");
    res.json({
      success: true,
      data: coverLetters,
    });
  } catch (err) {
    console.error("获取求职信列表错误:", err);
    res.status(500).json({
      success: false,
      message: "获取求职信列表失败",
    });
  }
});

// 获取单个求职信详情
router.get("/:id", protect, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).select("-__v");

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: "未找到该求职信",
      });
    }

    res.json({
      success: true,
      data: coverLetter,
    });
  } catch (err) {
    console.error("获取求职信详情错误:", err);
    res.status(500).json({
      success: false,
      message: "获取求职信详情失败",
    });
  }
});

// 删除求职信
router.delete("/:id", protect, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!coverLetter) {
      return res.status(404).json({
        success: false,
        message: "未找到该求职信",
      });
    }

    res.json({
      success: true,
      message: "求职信已删除",
    });
  } catch (err) {
    console.error("删除求职信错误:", err);
    res.status(500).json({
      success: false,
      message: "删除求职信失败",
    });
  }
});

module.exports = router;
