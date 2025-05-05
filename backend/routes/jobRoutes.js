const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  parseJobText,
  saveUserJob,
  getUserJobs,
  deleteUserJob,
} = require("../controllers/jobController");

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
