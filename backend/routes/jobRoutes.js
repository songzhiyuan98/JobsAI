const express = require("express");
const router = express.Router();
const jobSearchService = require("../services/jobSearchService");
const Job = require("../models/Job"); // 假设您有单独的模型文件
const { protect } = require("../middleware/auth");
const {
  parseJobText,
  saveUserJob,
  getUserJobs,
  deleteUserJob,
} = require("../controllers/jobController");

// 获取所有职位
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 按关键词搜索职位
router.get("/search", async (req, res) => {
  try {
    const { keyword, location, page = 1 } = req.query;

    if (!keyword || !location) {
      return res.status(400).json({ message: "关键词和位置是必需的" });
    }

    const jobs = await jobSearchService.getJobs(keyword, location, page);

    // 保存到数据库
    for (const job of jobs) {
      await jobSearchService.saveToMongoDB(job);
    }

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 手动触发完整的职位抓取
router.post("/fetch-all", async (req, res) => {
  try {
    // 异步执行，不等待完成
    jobSearchService
      .fetchAllJobs()
      .catch((err) => console.error("职位获取失败:", err));

    res.json({ message: "职位抓取已开始，请稍后检查数据库" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取湾区实习职位
router.post("/fetch-bay-area-internships", async (req, res) => {
  try {
    // 异步执行，不等待完成
    jobSearchService
      .smartFetchBayAreaInternships()
      .catch((err) => console.error("职位获取失败:", err));

    res.json({ message: "湾区实习职位抓取已开始，请稍后检查数据库" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// === 用户职位路由 (需要认证) ===

// 解析职位描述文本
router.post("/parse", protect, parseJobText);

// 保存用户职位描述
router.post("/", protect, saveUserJob);

// 获取用户保存的所有职位
router.get("/user", protect, getUserJobs); // 修改为/user路径

// 获取单个职位
router.get("/:id", protect, getUserJobs);

// 更新职位
router.put("/:id", protect, saveUserJob);

// 删除职位
router.delete("/:id", protect, deleteUserJob);

module.exports = router;
