const fs = require("fs");
const path = require("path");

// 确保上传目录存在
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("已创建上传目录:", uploadDir);
}

// 确保临时目录存在
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log("已创建临时目录:", tempDir);
}

console.log("服务器目录初始化完成");
