const mongoose = require("mongoose");

const atsAnalysisSchema = new mongoose.Schema({
  match_score_percent: Number,
  missing_keywords: [String],
  format_check: {
    bullets: Boolean,
    section_headers: Boolean,
    fonts_consistent: Boolean,
    verb_driven: Boolean,
    tech_result_impact: Boolean,
  },
  ats_pass_probability: Number,
  improvement_suggestions: [String],
  keywords_hit: [String],
  keywords_missing: [String],
});

const rankingAnalysisSchema = new mongoose.Schema({
  predicted_rank_percentile: Number,
  estimated_total_applicants: Number,
  top_5_diff: [
    {
      category: String,
      yours: String,
      top_candidates: String,
    },
  ],
  rank_boost_suggestions: [String],
});

const expressionIssueSchema = new mongoose.Schema({
  original: String,
  suggested: String,
  problem: String,
});

const hrAnalysisSchema = new mongoose.Schema({
  initial_impression: String,
  recommend_interview: Boolean,
  why_or_why_not: String,
  expression_issues: [expressionIssueSchema],
  market_reminder: String,
});

const interviewQuestionSchema = new mongoose.Schema({
  project: String,
  questions: [String],
});

const technicalAnalysisSchema = new mongoose.Schema({
  trust_level: {
    type: String,
    enum: ["low", "medium", "high"],
  },
  red_flags: [String],
  expected_tech_questions: [interviewQuestionSchema],
  technical_improvement: [String],
  project_deployment_verified: Boolean,
  data_complexity: String,
});

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
  overallMatchScore: Number,
  ats_analysis: atsAnalysisSchema,
  ranking_analysis: rankingAnalysisSchema,
  hr_analysis: hrAnalysisSchema,
  technical_analysis: technicalAnalysisSchema,
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Analysis = mongoose.model("Analysis", analysisSchema);

module.exports = Analysis;
