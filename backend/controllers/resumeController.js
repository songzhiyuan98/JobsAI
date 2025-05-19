const Resume = require("../models/Resume");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const {
  processResumeFile,
  mapToResumeModel,
} = require("../services/resumeParser");

// 上传并解析简历
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "没有上传文件",
      });
    }

    const userId = req.user.id;
    const resumeName = req.body.name || "我的简历";
    const filePath = req.file.path;

    console.log(`开始处理上传的简历文件: ${filePath}`);

    // 读取上传的文件
    const fileBuffer = fs.readFileSync(filePath);

    // 使用我们的解析服务提取结构化数据
    const extractedData = await processResumeFile(
      fileBuffer,
      req.file.originalname
    );

    // 将提取的数据映射到Resume模型格式
    const resumeData = mapToResumeModel(extractedData);

    // 保存文件路径
    const fileUrl = `/uploads/${path.basename(filePath)}`;

    // 创建新简历 (使用解析出的数据)
    const newResume = new Resume({
      user: userId,
      name: resumeName,
      originalFile: {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
      },
      ...resumeData,
    });

    await newResume.save();

    // 更新用户的简历引用
    await User.findByIdAndUpdate(userId, {
      $push: { resumes: newResume._id },
    });

    // 如果是用户的第一份简历，自动设为激活状态
    const user = await User.findById(userId);
    if (!user.activeResume) {
      user.activeResume = newResume._id;
      await user.save();
      newResume.isActive = true;
      await newResume.save();
    }

    res.status(201).json({
      success: true,
      message: "简历上传成功",
      data: newResume,
    });
  } catch (error) {
    console.error("简历处理错误:", error);
    res.status(500).json({
      success: false,
      message: `服务器错误: ${error.message}`,
    });
  }
};

// 获取用户所有简历
exports.getUserResumes = async (req, res) => {
  try {
    const userId = req.user.id;

    const resumes = await Resume.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    console.error("获取简历列表错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误，无法获取简历列表",
    });
  }
};

// 获取当前激活的简历
exports.getActiveResume = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user.activeResume) {
      return res.status(404).json({
        success: false,
        message: "您还没有激活的简历",
      });
    }

    const resume = await Resume.findById(user.activeResume);

    if (!resume) {
      // 如果指向的简历不存在，清除无效引用
      user.activeResume = null;
      await user.save();

      return res.status(404).json({
        success: false,
        message: "激活的简历不存在或已被删除",
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器错误，无法获取激活的简历",
    });
  }
};

// 获取单个简历详情
exports.getResumeById = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "简历不存在",
      });
    }

    // 检查所有权
    if (resume.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "无权访问此简历",
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("获取简历详情错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误，无法获取简历详情",
    });
  }
};

// 设置简历为激活状态
exports.setResumeActive = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;

    // 验证简历存在
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "简历不存在",
      });
    }

    // 检查所有权
    if (resume.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "无权操作此简历",
      });
    }

    // 更新用户的激活简历
    await User.findByIdAndUpdate(userId, { activeResume: resumeId });

    // 将其他简历设为非激活
    await Resume.updateMany(
      { user: userId, _id: { $ne: resumeId } },
      { isActive: false }
    );

    // 设置当前简历为激活
    resume.isActive = true;
    await resume.save();

    res.status(200).json({
      success: true,
      message: "简历已设为激活状态",
      data: resume,
    });
  } catch (error) {
    console.error("设置激活简历错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误，无法设置激活简历",
    });
  }
};

// 更新简历
exports.updateResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;

    // 验证简历存在
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "简历不存在",
      });
    }

    // 检查所有权
    if (resume.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "无权操作此简历",
      });
    }

    // 更新可以修改的字段
    const allowedUpdates = [
      "name",
      "basicInfo",
      "education",
      "experience",
      "projects",
      "skills",
      "honors",
    ];

    allowedUpdates.forEach((update) => {
      if (req.body[update] !== undefined) {
        resume[update] = req.body[update];
      }
    });

    resume.updatedAt = Date.now();

    await resume.save();

    res.status(200).json({
      success: true,
      message: "简历已更新",
      data: resume,
    });
  } catch (error) {
    console.error("更新简历错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误，无法更新简历",
    });
  }
};

// 删除简历
exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;

    // 验证简历存在
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "简历不存在",
      });
    }

    // 检查所有权
    if (resume.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "无权操作此简历",
      });
    }

    // 如果要删除的是激活的简历，清除用户的activeResume
    const user = await User.findById(userId);
    if (user.activeResume && user.activeResume.toString() === resumeId) {
      user.activeResume = null;
      await user.save();
    }

    // 从用户的resumes数组中删除引用
    await User.findByIdAndUpdate(userId, {
      $pull: { resumes: resumeId },
    });

    // 删除文件
    if (resume.originalFile && resume.originalFile.fileUrl) {
      const filePath = path.join(__dirname, "..", resume.originalFile.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 删除简历记录
    await Resume.findByIdAndDelete(resumeId);

    res.status(200).json({
      success: true,
      message: "简历已删除",
    });
  } catch (error) {
    console.error("删除简历错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误，无法删除简历",
    });
  }
};
