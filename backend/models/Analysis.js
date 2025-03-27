const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserJob",
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
  },
  matchProbability: {
    type: String,
    enum: ["低", "中", "高", "未知"],
    default: "未知",
  },
  keyRequirements: [
    {
      type: String,
    },
  ],
  strengths: [
    {
      type: String,
    },
  ],
  weaknesses: [
    {
      type: String,
    },
  ],
  possibleQuestions: [
    {
      type: String,
    },
  ],
  improvementSuggestions: [
    {
      type: String,
    },
  ],
  rawAnalysis: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Analysis", AnalysisSchema);
