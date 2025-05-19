// 简历分析服务
const OpenAI = require("openai");
const Analysis = require("../models/analysis");
const { default: axios } = require("axios");
const { gpt4oPrompt, geminiPrompt, defaultPrompt } = require("./aiPrompts");
const Gpt4oAnalysis = require("../models/gpt4oAnalysis");
const { robustAIRequest, extractJsonFromText } = require("./aiService");

// 创建OpenAI客户端实例
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 分析简历与职位匹配度
 * @param {Object} job - 职位对象
 * @param {Object} resume - 简历对象
 * @param {string} model - AI模型（如gpt-4o、gemini-2-flash）
 */
const analyzeResumeMatch = async (job, resume, model = "gemini-2.0-flash") => {
  try {
    const jobStr = JSON.stringify(job, null, 2);
    const resumeStr = JSON.stringify(resume, null, 2);

    // 调试打印
    console.log("[分析服务] 收到模型参数:", model);

    // 选择prompt模板
    let systemPrompt = "";
    if (model.startsWith("gemini")) {
      systemPrompt = geminiPrompt;
      console.log(
        "[分析服务] 使用Gemini，prompt片段:",
        systemPrompt.slice(0, 30)
      );
    } else {
      systemPrompt = defaultPrompt;
      console.log(
        "[分析服务] 使用其他模型，prompt片段:",
        systemPrompt.slice(0, 30)
      );
    }

    let result;
    if (model.startsWith("gemini")) {
      console.log("[分析服务] 调用增强版Gemini接口（支持自动重试和内容裁剪）");
      try {
        // 使用robustAIRequest处理请求
        const aiResponse = await robustAIRequest({
          model,
          prompt: systemPrompt,
          jobContent: jobStr,
          resumeContent: resumeStr,
          contentTypes: { job: "job", resume: "resume" }, // 标记内容类型
          maxRetries: 2,
          contentReductionPercent: 30,
        });

        // 提取结果
        result = aiResponse.json;
      } catch (error) {
        console.error("[分析服务] Gemini处理失败：", error);
        throw new Error("简历分析服务出现错误，请稍后再试");
      }
    } else {
      console.log("[分析服务] 调用OpenAI其他模型接口:", model);
      const response = await openaiClient.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt
              .replace("{{jobStr}}", jobStr)
              .replace("{{resumeStr}}", resumeStr),
          },
        ],
        temperature: 0.7,
        max_tokens: 3500,
        response_format: { type: "json_object" },
      });

      // 解析JSON响应
      try {
        result = JSON.parse(response.choices[0].message.content);
      } catch (e) {
        console.error("JSON解析失败:", e);
        throw new Error("AI返回结果解析失败");
      }
    }

    // 返回结构化内容
    return {
      rawAnalysis: JSON.stringify(result),
      structured: {
        matchScore:
          result.matchScore || result.ats_analysis?.match_score_percent || 0,
        matchProbability: result.matchProbability || "中",
        keyRequirements:
          result.keyRequirements || result.ats_analysis?.keywords_hit || [],
        strengths:
          result.strengths ||
          result.ranking_analysis?.rank_boost_suggestions ||
          [],
        weaknesses:
          result.weaknesses || result.ats_analysis?.missing_keywords || [],
        possibleQuestions:
          result.possibleQuestions ||
          result.technical_analysis?.expected_tech_questions?.flatMap(
            (q) => q.questions
          ) ||
          [],
        improvementSuggestions:
          result.improvementSuggestions ||
          result.ats_analysis?.improvement_suggestions ||
          [],
        ats_analysis: result.ats_analysis || {},
        ranking_analysis: result.ranking_analysis || {},
        hr_analysis: result.hr_analysis || {},
        technical_analysis: result.technical_analysis || {},
      },
    };
  } catch (error) {
    console.error("简历分析失败:", error);
    throw new Error("简历分析服务出现错误，请稍后再试");
  }
};

// 获取简历分析
const getAnalysisById = async (analysisId) => {
  let analysis = await Gpt4oAnalysis.findById(analysisId)
    .populate("userId", "name email")
    .populate("resumeId", "title content")
    .populate("jobId", "title company description");
  if (analysis) return analysis;

  analysis = await Analysis.findById(analysisId)
    .populate("userId", "name email")
    .populate("resumeId", "title content")
    .populate("jobId", "title company description");
  if (analysis) return analysis;

  throw new Error("分析结果不存在");
};

async function generateGpt4oAnalysis(jobStr, resumeStr) {
  const prompt = gpt4oPrompt
    .replace("{{jobStr}}", jobStr)
    .replace("{{resumeStr}}", resumeStr);

  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  let result;
  try {
    result = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error("AI 返回内容解析失败，请检查 prompt 或输出格式");
  }

  // 结构转换，适配数据库 schema
  return {
    summary: result.summary,
    gapAnalysis: {
      technicalGaps: result.gap_analysis?.["技术匹配差距"] || [],
      businessGaps: result.gap_analysis?.["业务理解或行业经验差距"] || [],
      resumeGaps: result.gap_analysis?.["简历表达不足或模糊点"] || [],
      keywordGaps: result.gap_analysis?.["关键词覆盖缺失"] || [],
    },
    opportunityHighlights: result.opportunity_highlights || [],
    strategicImprovements: {
      resumeSuggestions: result.strategic_improvements?.["简历修改建议"] || [],
      coverLetterSuggestions:
        result.strategic_improvements?.["Cover Letter 推荐内容"] || [],
      interviewFocus: result.strategic_improvements?.["面试预判重点"] || [],
    },
    longTermDevelopment: {
      skillStack: result.long_term_development_plan?.["建议提升技能栈"] || [],
      industryExperience:
        result.long_term_development_plan?.["行业经验建议"] || "",
      behavioralPreparation:
        result.long_term_development_plan?.["行为面试准备建议"] || "",
    },
    model: "gpt4o",
  };
}

module.exports = {
  analyzeResumeMatch,
  getAnalysisById,
  generateGpt4oAnalysis,
};
