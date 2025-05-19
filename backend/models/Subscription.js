const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionType: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    paymentId: {
      type: String,
      required: function () {
        return this.subscriptionType !== "free";
      },
    },
    features: {
      gemini: {
        type: Boolean,
        default: true, // 所有用户都可以使用 Gemini
      },
      gpt4o: {
        type: Boolean,
        default: function () {
          return (
            this.subscriptionType === "premium" ||
            this.subscriptionType === "enterprise"
          );
        },
      },
      o1: {
        type: Boolean,
        default: function () {
          return this.subscriptionType === "enterprise";
        },
      },
    },
    dailyUsage: {
      gpt4oResumeAnalysis: {
        type: Number,
        default: 0,
      },
      gpt4oCoverLetter: {
        type: Number,
        default: 0,
      },
    },
    lastUsageReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 检查并重置每日使用次数
subscriptionSchema.methods.checkAndResetDailyUsage = function () {
  const now = new Date();
  const lastReset = new Date(this.lastUsageReset);

  // 如果最后重置时间不是今天，重置计数器
  if (lastReset.toDateString() !== now.toDateString()) {
    this.dailyUsage = {
      gpt4oResumeAnalysis: 0,
      gpt4oCoverLetter: 0,
    };
    this.lastUsageReset = now;
    return true;
  }
  return false;
};

// 获取剩余使用次数
subscriptionSchema.methods.getRemainingUsage = function (action) {
  this.checkAndResetDailyUsage();

  switch (action) {
    case "gpt4oResumeAnalysis":
      return 1 - this.dailyUsage.gpt4oResumeAnalysis;
    case "gpt4oCoverLetter":
      return 1 - this.dailyUsage.gpt4oCoverLetter;
    default:
      return 0;
  }
};

// 检查是否可以执行特定操作
subscriptionSchema.methods.canPerformAction = function (action) {
  // 检查订阅是否有效
  if (this.status !== "active") {
    return false;
  }

  // 检查订阅是否过期
  if (this.endDate && new Date() > this.endDate) {
    return false;
  }

  // 根据操作类型检查权限
  switch (action) {
    case "useGemini":
      return true; // 所有用户都可以使用 Gemini
    case "useGpt4o":
      return true; // 所有用户都可以使用一次 GPT-4o
    case "useO1":
      return this.features.o1;
    case "gpt4oResumeAnalysis":
    case "analysis":
      if (action === "analysis") return true; // 所有用户都可以使用分析功能
      this.checkAndResetDailyUsage();
      return this.dailyUsage.gpt4oResumeAnalysis < 1;
    case "gpt4oCoverLetter":
    case "coverLetter":
      if (action === "coverLetter") return true; // 所有用户都可以使用求职信功能
      this.checkAndResetDailyUsage();
      return this.dailyUsage.gpt4oCoverLetter < 1;
    default:
      return false;
  }
};

// 记录使用次数
subscriptionSchema.methods.recordUsage = function (action) {
  this.checkAndResetDailyUsage();

  switch (action) {
    case "gpt4oResumeAnalysis":
    case "analysis":
      this.dailyUsage.gpt4oResumeAnalysis += 1;
      break;
    case "gpt4oCoverLetter":
    case "coverLetter":
      this.dailyUsage.gpt4oCoverLetter += 1;
      break;
  }
};

module.exports = mongoose.model("Subscription", subscriptionSchema);
