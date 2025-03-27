const mongoose = require("mongoose");

// 定义职位模型
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  url: String,
  snippet: String,
  posted_date: String,
  source: String,
  keywords: [String],
  search_location: String,
  scraped_date: { type: Date, default: Date.now },
  job_id: { type: String, unique: true },
  description: String,
  requirements: [String],
  salary_min: Number,
  salary_max: Number,
  salary_currency: String,
  employment_type: String,
});

// 创建并导出模型
const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
