const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      role: {
        type: String,
        enum: ["system", "user", "assistant"],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  context: {
    job: Object,
    resume: Object,
    currentRound: {
      type: Number,
      default: 0,
    },
    maxRounds: {
      type: Number,
      default: 10,
    },
    askedQuestions: [String],
    evaluatedSkills: Object,
    interviewProgress: {
      type: Number,
      default: 0,
    },
    remainingTime: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Session", SessionSchema);
