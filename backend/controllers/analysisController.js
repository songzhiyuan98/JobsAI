const UserJob = require("../models/UserJob");
const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis"); // 需要创建新模型
const { analyzeResumeMatch } = require("../services/resumeAnalysisService");

/**
 * 创建简历分析
 */
const createAnalysis = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;
    const userId = req.user.id;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: "职位ID和简历ID不能为空",
      });
    }

    // 查询职位和简历完整信息
    const job = await UserJob.findById(jobId);
    const resume = await Resume.findById(resumeId);

    if (!job || !resume) {
      return res.status(404).json({
        success: false,
        message: "找不到指定的职位或简历",
      });
    }

    // 分析简历与职位匹配度
    const analysisResult = await analyzeResumeMatch(job, resume);

    // 保存分析结果
    const analysis = new Analysis({
      user: userId,
      job: jobId,
      resume: resumeId,
      matchScore: analysisResult.structured.matchScore,
      matchProbability: analysisResult.structured.matchProbability,
      keyRequirements: analysisResult.structured.keyRequirements,
      strengths: analysisResult.structured.strengths,
      weaknesses: analysisResult.structured.weaknesses,
      possibleQuestions: analysisResult.structured.possibleQuestions,
      improvementSuggestions: analysisResult.structured.improvementSuggestions,
      rawAnalysis: analysisResult.rawAnalysis,
      createdAt: new Date(),
    });

    await analysis.save();

    // 返回结果
    return res.status(201).json({
      success: true,
      data: {
        _id: analysis._id,
        matchScore: analysis.matchScore,
        matchProbability: analysis.matchProbability,
      },
      message: "简历分析完成",
    });
  } catch (error) {
    console.error("创建分析失败:", error);
    return res.status(500).json({
      success: false,
      message: "创建分析失败，请重试",
    });
  }
};

/**
 * 获取分析详情
 */
const getAnalysis = async (req, res) => {
  try {
    const analysisId = req.params.id;
    const userId = req.user.id;

    const analysis = await Analysis.findById(analysisId)
      .populate("job")
      .populate("resume");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "找不到指定的分析报告",
      });
    }

    if (analysis.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "您无权访问此分析报告",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("获取分析详情失败:", error);
    return res.status(500).json({
      success: false,
      message: "获取分析详情失败，请重试",
    });
  }
};

/**
 * 获取用户所有分析报告
 */
const getUserAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;

    const analyses = await Analysis.find({ user: userId })
      .populate("job", "title company")
      .populate("resume", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error("获取分析列表失败:", error);
    return res.status(500).json({
      success: false,
      message: "获取分析列表失败，请重试",
    });
  }
};

module.exports = {
  createAnalysis,
  getAnalysis,
  getUserAnalyses,
};
