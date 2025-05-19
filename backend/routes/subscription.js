const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const checkSubscription = require("../middleware/checkSubscription");
const Subscription = require("../models/Subscription");

// 检查功能权限
router.get(
  "/check-permission",
  protect,
  checkSubscription,
  async (req, res) => {
    try {
      const { action } = req.query;
      const subscription = req.subscription;

      // 检查是否可以执行操作
      const allowed = subscription.canPerformAction(action);

      res.json({ allowed });
    } catch (error) {
      console.error("检查权限失败:", error);
      res.status(500).json({ message: "检查权限失败" });
    }
  }
);

// 获取剩余使用次数
router.get("/usage", protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: "active",
    });

    if (!subscription) {
      // 如果没有订阅记录，返回默认值
      return res.json({
        remainingUsage: {
          analysis: 1,
          coverLetter: 1,
        },
      });
    }

    // 检查并重置每日使用次数
    subscription.checkAndResetDailyUsage();
    await subscription.save();

    // 返回剩余使用次数
    res.json({
      remainingUsage: {
        analysis: 1 - subscription.dailyUsage.gpt4oResumeAnalysis,
        coverLetter: 1 - subscription.dailyUsage.gpt4oCoverLetter,
      },
    });
  } catch (error) {
    console.error("获取剩余使用次数失败:", error);
    res.status(500).json({
      success: false,
      message: "获取剩余使用次数失败",
    });
  }
});

module.exports = router;
