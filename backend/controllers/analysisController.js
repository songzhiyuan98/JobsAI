const UserJob = require("../models/UserJob");
const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");
const {
  analyzeResumeMatch,
  extractStructuredData,
  getAnalysisById,
  generateGpt4oAnalysis,
} = require("../services/resumeAnalysisService");
const {
  processResumeFile,
  mapToResumeModel,
} = require("../services/resumeParser");
const { parseJobDescription } = require("../services/jobParser");
const path = require("path");
const fs = require("fs");
const checkSubscription = require("../middleware/checkSubscription");
const Gpt4oAnalysis = require("../models/gpt4oAnalysis");

/**
 * 创建简历分析
 */
const createAnalysis = async (req, res) => {
  try {
    const { resumeId, jobId, model } = req.body;
    const userId = req.user.id;
    console.log("[后端] 开始创建分析...");

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

    if (model === "gpt-4o") {
      // 1. 生成 gpt-4o 分析
      const analysisData = await generateGpt4oAnalysis(job, resume);
      // 2. 存入 gpt4oAnalysis 表
      const doc = await Gpt4oAnalysis.create({
        userId,
        jobId,
        resumeId,
        ...analysisData,
      });
      return res.json({ data: doc, model: "gpt4o" });
    } else {
      // 1. 生成通用分析
      const analysisResult = await analyzeResumeMatch(
        job,
        resume,
        model || "gemini-2.0-flash"
      );

      // 验证结构化数据
      if (!analysisResult.structured || !analysisResult.structured.matchScore) {
        console.error("结构化数据无效:", analysisResult.structured);
        // 尝试重新提取
        analysisResult.structured = extractStructuredData(
          analysisResult.rawAnalysis
        );
      }

      // 2. 存入 analysis 表
      const analysis = new Analysis({
        userId,
        jobId,
        resumeId,
        matchScore: analysisResult.structured.matchScore,
        matchProbability: analysisResult.structured.matchProbability,
        keyRequirements: analysisResult.structured.keyRequirements,
        strengths: analysisResult.structured.strengths,
        weaknesses: analysisResult.structured.weaknesses,
        possibleQuestions: analysisResult.structured.possibleQuestions,
        improvementSuggestions:
          analysisResult.structured.improvementSuggestions,
        rawAnalysis: analysisResult.rawAnalysis,
        ats_analysis: analysisResult.structured.ats_analysis,
        ranking_analysis: analysisResult.structured.ranking_analysis,
        hr_analysis: analysisResult.structured.hr_analysis,
        technical_analysis: analysisResult.structured.technical_analysis,
        model,
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
    }
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
    const { jobId } = req.query; // 从查询参数中获取 jobId

    // 构建查询条件
    const query = { userId };
    if (jobId) {
      query.jobId = jobId;
    }

    const gpt4oAnalyses = await Gpt4oAnalysis.find(query)
      .populate("jobId", "title company")
      .populate("resumeId", "name")
      .sort({ createdAt: -1 });

    const analyses = await Analysis.find(query)
      .populate("jobId", "title company")
      .populate("resumeId", "name")
      .sort({ createdAt: -1 });

    const allAnalyses = [
      ...gpt4oAnalyses.map((a) => ({ ...a._doc, model: "gpt4o" })),
      ...analyses.map((a) => ({ ...a._doc, model: a.model || "gemini" })),
    ].sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json({
      success: true,
      data: allAnalyses,
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
