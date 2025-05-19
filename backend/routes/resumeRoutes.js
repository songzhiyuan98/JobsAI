const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

// 上传简历 - 需要文件上传中间件
router.post(
  "/upload",
  protect,
  upload.single("resume"),
  resumeController.uploadResume
);

// 获取当前激活的简历 - 放在 /:id 路由之前
router.get("/active", protect, resumeController.getActiveResume);

// 获取用户所有简历
router.get("/", protect, resumeController.getUserResumes);

// 获取单个简历详情
router.get("/:id", protect, resumeController.getResumeById);

// 设置激活状态
router.put("/:id/set-active", protect, resumeController.setResumeActive);

// 更新简历
router.put("/:id", protect, resumeController.updateResume);

// 删除简历
router.delete("/:id", protect, resumeController.deleteResume);

module.exports = router;
