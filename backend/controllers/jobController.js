const UserJob = require("../models/UserJob");
const { parseJobDescription } = require("../services/jobParser");

// 解析JD文本
const parseJobText = async (req, res) => {
  try {
    const { jobText } = req.body;

    if (!jobText) {
      return res.status(400).json({
        success: false,
        message: "请提供职位描述文本",
      });
    }

    const parsedJob = await parseJobDescription(jobText);

    return res.status(200).json({
      success: true,
      data: parsedJob,
    });
  } catch (error) {
    console.error("解析职位描述失败:", error);
    return res.status(500).json({
      success: false,
      message: "服务器错误，解析职位描述失败",
    });
  }
};

// 保存用户JD
const saveUserJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      requirements,
      preferred_qualifications,
      tech_stack,
      original_text,
      source_url,
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "职位名称和公司名称为必填项",
      });
    }

    // 检查是否已存在相同职位
    const existingJob = await UserJob.findOne({
      user: req.user.id,
      title: title,
      company: company,
    });

    // 如果已存在相同职位，直接返回该职位
    if (existingJob) {
      return res.status(200).json({
        success: true,
        data: existingJob,
        message: "已使用现有职位",
      });
    }

    // 如果提供了ID，则更新现有记录
    if (req.params.id) {
      const updatedJob = await UserJob.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        {
          title,
          company,
          location,
          description,
          requirements,
          preferred_qualifications,
          tech_stack,
          original_text,
          source_url,
          isVerified: true,
        },
        { new: true }
      );

      if (!updatedJob) {
        return res.status(404).json({
          success: false,
          message: "未找到职位或无权修改",
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedJob,
      });
    }

    const newJob = new UserJob({
      user: req.user.id,
      title,
      company,
      location,
      description,
      requirements,
      preferred_qualifications,
      tech_stack,
      original_text,
      source_url,
      isVerified: true, // 用户确认后的JD默认已验证
    });

    await newJob.save();

    return res.status(201).json({
      success: true,
      data: newJob,
    });
  } catch (error) {
    console.error("保存职位描述失败:", error);
    return res.status(500).json({
      success: false,
      message: "服务器错误，保存职位描述失败",
    });
  }
};

// 获取用户保存的所有JD
const getUserJobs = async (req, res) => {
  try {
    // 检查是否请求单个职位
    if (req.params.id) {
      const job = await UserJob.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "未找到职位",
        });
      }

      return res.status(200).json({
        success: true,
        data: job,
      });
    }

    const jobs = await UserJob.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("获取用户职位失败:", error);
    return res.status(500).json({
      success: false,
      message: "服务器错误，获取用户职位失败",
    });
  }
};

// 删除用户职位
const deleteUserJob = async (req, res) => {
  try {
    const deletedJob = await UserJob.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "未找到职位或无权删除",
      });
    }

    return res.status(200).json({
      success: true,
      message: "职位已成功删除",
    });
  } catch (error) {
    console.error("删除职位失败:", error);
    return res.status(500).json({
      success: false,
      message: "服务器错误，删除职位失败",
    });
  }
};

module.exports = {
  parseJobText,
  saveUserJob,
  getUserJobs,
  deleteUserJob,
};
