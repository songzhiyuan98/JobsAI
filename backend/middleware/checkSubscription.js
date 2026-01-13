const Subscription = require("../models/Subscription");
const User = require("../models/User");

// ============================================================
// 临时禁用付费限制 - 所有功能对所有用户开放
// 要恢复付费功能，将此值改为 false
// ============================================================
const DISABLE_SUBSCRIPTION_CHECK = true;

const checkSubscription = (action) => {
  return async (req, res, next) => {
    try {
      // 如果禁用订阅检查，直接放行所有请求
      if (DISABLE_SUBSCRIPTION_CHECK) {
        return next();
      }

      const userId = req.user.id;

      // 先获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      // 检查用户订阅状态
      if (user.subscriptionStatus === "free") {
        // 免费用户可以使用 Gemini 模型和一次 GPT-4o
        const model = req.body.model || req.query.model;
        if (model === "gpt-o1") {
          return res.status(403).json({
            success: false,
            message: "需要升级到企业版才能使用 GPT-o1 模型",
          });
        }
      }

      // 查找或创建订阅记录
      let subscription = await Subscription.findOne({
        userId,
        status: "active",
      });

      // 如果没有订阅记录，创建一个免费订阅
      if (!subscription) {
        subscription = new Subscription({
          userId,
          subscriptionType: "free",
          startDate: new Date(),
          status: "active",
        });
        await subscription.save();
      }

      // 检查是否可以执行操作
      if (!subscription.canPerformAction(action)) {
        // 根据操作类型返回不同的错误消息
        let message = "您的订阅级别不支持此功能";
        const model = req.body.model || req.query.model;

        if (model === "gpt-4o" || model === "gpt-o1") {
          const remainingAnalysis = subscription.getRemainingUsage(
            "gpt4oResumeAnalysis"
          );
          const remainingCoverLetter =
            subscription.getRemainingUsage("gpt4oCoverLetter");
          message = `您今日的 GPT-4o 使用次数已用完（简历分析剩余 ${remainingAnalysis} 次，求职信剩余 ${remainingCoverLetter} 次），请明天再试或升级到会员版`;
        }

        return res.status(403).json({
          success: false,
          message,
          remainingUsage: {
            analysis: subscription.getRemainingUsage("gpt4oResumeAnalysis"),
            coverLetter: subscription.getRemainingUsage("gpt4oCoverLetter"),
          },
        });
      }

      // 记录使用次数
      subscription.recordUsage(action);
      await subscription.save();

      // 将订阅信息添加到请求对象中
      req.subscription = subscription;

      // 添加剩余使用次数到响应头
      res.setHeader(
        "X-Remaining-Usage",
        JSON.stringify({
          analysis: subscription.getRemainingUsage("gpt4oResumeAnalysis"),
          coverLetter: subscription.getRemainingUsage("gpt4oCoverLetter"),
        })
      );

      next();
    } catch (error) {
      console.error("检查订阅权限时出错:", error);
      res.status(500).json({
        success: false,
        message: "服务器错误，请稍后再试",
      });
    }
  };
};

module.exports = checkSubscription;
