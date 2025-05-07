const mongoose = require("mongoose");

const CoverLetterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserJob",
    required: true,
  },
  recipient: { type: String, required: true }, // 收件人/公司/职位
  subject: { type: String, required: true }, // 求职信标题
  paragraphs: [{ type: String, required: true }], // 正文段落数组
  closing: { type: String, required: true }, // 结尾敬语
  signature: { type: String, required: true }, // 签名
  highlights: [String], // 亮点
  suggestions: [String], // 优化建议
  model: { type: String, default: "gemini" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CoverLetter", CoverLetterSchema);
