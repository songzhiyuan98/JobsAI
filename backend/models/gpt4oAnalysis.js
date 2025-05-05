const mongoose = require("mongoose");

const gpt4oAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "UserJob" },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  model: { type: String, default: "gpt4o" },
  summary: String,
  gapAnalysis: {
    technicalGaps: [String],
    businessGaps: [String],
    resumeGaps: [String],
    keywordGaps: [String],
  },
  opportunityHighlights: [String],
  strategicImprovements: {
    resumeSuggestions: [String],
    coverLetterSuggestions: [String],
    interviewFocus: [String],
  },
  longTermDevelopment: {
    skillStack: [String],
    industryExperience: String,
    behavioralPreparation: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Gpt4oAnalysis", gpt4oAnalysisSchema);
