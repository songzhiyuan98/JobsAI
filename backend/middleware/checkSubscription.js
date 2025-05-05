const Subscription = require("../models/Subscription");

const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { model } = req.body;

    // Gemini模型始终可用
    if (model === "gemini-2.0-flash") {
      return next();
    }

    // 检查用户订阅状态
    const subscription = await Subscription.findOne({
      userId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({
        message: "需要订阅会员才能使用此模型",
      });
    }

    // 检查特定模型权限
    let hasAccess = false;
    switch (model) {
      case "gpt-3.5":
        hasAccess = subscription.features.gpt3_5;
        break;
      case "gpt-4o":
        hasAccess = subscription.features.gpt4o;
        break;
      case "claude-3.5":
        hasAccess = subscription.features.claude;
        break;
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: "您的订阅不包含此模型的使用权限",
      });
    }

    next();
  } catch (error) {
    console.error("检查订阅状态失败:", error);
    res.status(500).json({ message: "检查订阅状态失败" });
  }
};

module.exports = checkSubscription;
