const mongoose = require("mongoose");

// 用户保存的职位描述模型
const userJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    company: String,
    location: String,
    description: String,
    requirements: [String],
    preferred_qualifications: [String],
    tech_stack: [String],
    original_text: String, // 存储原始文本
    source_url: String,
    notes: String,
    companyInfo: String, // 公司信息
    status: {
      type: String,
      enum: ["saved", "applied", "interviewing", "offered", "rejected"],
      default: "saved",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserJob = mongoose.model("UserJob", userJobSchema);

module.exports = UserJob;
