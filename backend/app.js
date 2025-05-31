const express = require("express");
const mongoose = require("mongoose");
const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const paymentRouter = require("./routes/payment");
const coverLetterRoutes = require("./routes/coverLetterRoutes");
const subscriptionRoutes = require("./routes/subscription");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// 配置 CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL, // 使用环境变量
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 1. 只让 webhook 路由用 raw
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    console.log("收到 webhook 请求");
    next();
  },
  paymentRouter
);

// 2. 其他中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 路由
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/payment", paymentRouter);
app.use("/api/cover-letters", coverLetterRoutes);
app.use("/api/subscription", subscriptionRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "服务器内部错误",
  });
});

// 连接MongoDB
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/ai_interview_assistant"
  )
  .then(() => console.log("连接到MongoDB成功"))
  .catch((err) => console.error("连接MongoDB失败:", err));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
