const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: "My Resume",
  },
  originalFile: {
    fileName: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  basicInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    links: [
      {
        type: String,
        url: String,
      },
    ],
  },
  education: [
    {
      institution: String,
      degree: String,
      major: String,
      gpa: Number,
      startDate: Date,
      endDate: Date,
      courses: [String],
    },
  ],
  experience: [
    {
      company: String,
      position: String,
      location: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      instruction: String,
      descriptions: [String],
    },
  ],
  projects: [
    {
      name: String,
      instruction: String,
      descriptions: [String],
      startDate: Date,
      endDate: Date,
      links: [String],
    },
  ],
  skills: [
    {
      category: String,
      items: [String],
    },
  ],
  honors: [
    {
      title: String,
      date: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", ResumeSchema);
