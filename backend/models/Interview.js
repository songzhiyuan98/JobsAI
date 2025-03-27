const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema(
  {
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
    currentSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    settings: {
      maxRounds: {
        type: Number,
        default: 10,
      },
      language: {
        type: String,
        default: "zh-CN",
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      maxTime: {
        type: Number,
        default: 1800,
      },
      behavioralRounds: {
        type: Number,
        default: 2,
      },
      technicalRounds: {
        type: Number,
        default: 8,
      },
      followUpDepth: {
        type: Number,
        default: 2,
      },
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", InterviewSchema);
