const UserJob = require("../models/UserJob");
const Resume = require("../models/Resume");
const Analysis = require("../models/analysis");
const {
  analyzeResumeMatch,
  extractStructuredData,
  getAnalysisById,
} = require("../services/resumeAnalysisService");

/**
 * 创建简历分析
 */
const createAnalysis = async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;
    const userId = req.user.id;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: "职位ID和简历ID不能为空",
      });
    }

    // 检查是否已存在分析
    const existingAnalysis = await Analysis.findOne({
      userId: userId,
      jobId: jobId,
      resumeId: resumeId,
    });

    if (existingAnalysis) {
      return res.status(200).json({
        success: true,
        data: {
          _id: existingAnalysis._id,
          matchScore: existingAnalysis.matchScore,
          matchProbability: existingAnalysis.matchProbability,
        },
        message: "已使用现有分析结果",
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

    // 检查简历是否属于当前用户
    if (resume.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "无权访问此简历",
      });
    }

    // 分析简历与职位匹配度
    const analysisResult = await analyzeResumeMatch(job, resume);

    // 验证结构化数据
    if (!analysisResult.structured || !analysisResult.structured.matchScore) {
      console.error("结构化数据无效:", analysisResult.structured);
      // 尝试重新提取
      analysisResult.structured = extractStructuredData(
        analysisResult.rawAnalysis
      );
    }

    // 保存分析结果
    const analysis = new Analysis({
      userId: userId,
      jobId: jobId,
      resumeId: resumeId,
      matchScore: analysisResult.structured.matchScore,
      matchProbability: analysisResult.structured.matchProbability,
      keyRequirements: analysisResult.structured.keyRequirements,
      strengths: analysisResult.structured.strengths,
      weaknesses: analysisResult.structured.weaknesses,
      possibleQuestions: analysisResult.structured.possibleQuestions,
      improvementSuggestions: analysisResult.structured.improvementSuggestions,
      rawAnalysis: analysisResult.rawAnalysis,
      ats_analysis: analysisResult.structured.ats_analysis,
      ranking_analysis: analysisResult.structured.ranking_analysis,
      hr_analysis: analysisResult.structured.hr_analysis,
      technical_analysis: analysisResult.structured.technical_analysis,
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
    const { id } = req.params;
    const userId = req.user.id;

    // 获取分析结果
    const analysis = await getAnalysisById(id);

    // 验证权限
    if (analysis.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "无权访问此分析结果" });
    }

    // 准备前端所需数据
    const responseData = {
      ...analysis._doc,
      job: analysis.jobId, // 为了兼容前端，添加job字段
      resume: analysis.resumeId, // 为了兼容前端，添加resume字段
      user: analysis.userId, // 为了兼容前端，添加user字段
    };

    // 返回分析结果
    res.status(200).json(responseData);
  } catch (error) {
    console.error("获取分析错误:", error);
    res.status(500).json({ message: "获取分析失败", error: error.message });
  }
};

/**
 * 获取用户所有分析报告
 */
const getUserAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;

    const analyses = await Analysis.find({ userId: userId })
      .populate("jobId", "title company")
      .populate("resumeId", "name")
      .sort({ createdAt: -1 });

    // 转换响应格式以兼容前端
    const formattedAnalyses = analyses.map((analysis) => ({
      ...analysis._doc,
      job: analysis.jobId,
      resume: analysis.resumeId,
    }));

    return res.status(200).json({
      success: true,
      data: formattedAnalyses,
    });
  } catch (error) {
    console.error("获取分析列表失败:", error);
    return res.status(500).json({
      success: false,
      message: "获取分析列表失败，请重试",
    });
  }
};

// 获取指定职位的所有分析报告
const getAnalysisByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // 查找指定职位的所有分析报告，按创建时间降序排序
    const reports = await Analysis.find({ jobId: jobId, userId: userId })
      .populate({
        path: "resumeId",
        select: "basicInfo isActive createdAt",
      })
      .sort({ createdAt: -1 });

    // 转换响应格式以兼容前端
    const formattedReports = reports.map((report) => ({
      ...report._doc,
      resume: report.resumeId,
    }));

    return res.status(200).json({
      success: true,
      data: formattedReports,
      message: "获取分析报告成功",
    });
  } catch (error) {
    console.error("获取职位分析报告失败:", error);
    return res.status(500).json({
      success: false,
      message: "服务器错误，无法获取分析报告",
    });
  }
};

module.exports = {
  createAnalysis,
  getAnalysis,
  getUserAnalyses,
  getAnalysisByJob,
};
