const OpenAI = require("openai");
const Analysis = require("../models/analysis");

// 创建OpenAI客户端实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 分析简历与职位匹配度
 */
const analyzeResumeMatch = async (job, resume) => {
  try {
    // 将职位和简历数据转换为字符串
    const jobStr = JSON.stringify(job, null, 2);
    const resumeStr = JSON.stringify(resume, null, 2);

    // 构建系统提示词
    const systemPrompt = `你是一位专业的职业顾问、技术面试官和招聘专家。
请分析候选人的简历与职位描述的匹配情况，并返回结构化的JSON分析(请使用中文回答)，包含4个关键维度：

1. ATS系统分析
2. 与其他候选人的排名比较
3. 招聘人员(HR)印象和面试决策
4. 技术面试官洞见

--- 职位描述 ---
${jobStr}

--- 简历内容 ---
${resumeStr}

请严格按照以下JSON格式返回分析结果：

{
  "ats_analysis": {
    "match_score_percent": 整数,
    "missing_keywords": ["关键词1", "关键词2"],
    "format_check": {
      "bullets": 布尔值,
      "section_headers": 布尔值,
      "fonts_consistent": 布尔值,
      "verb_driven": 布尔值,
      "tech_result_impact": 布尔值
    },
    "ats_pass_probability": 小数,
    "improvement_suggestions": ["建议1", "建议2"],
    "keywords_hit": ["关键词1", "关键词2"],
    "keywords_missing": ["关键词1", "关键词2"]
  },
  "ranking_analysis": {
    "predicted_rank_percentile": 整数,
    "estimated_total_applicants": 整数,
    "top_5_diff": [
      {
        "category": "类别名称",
        "yours": "你的情况",
        "top_candidates": "顶尖候选人情况"
      }
    ],
    "rank_boost_suggestions": ["建议1", "建议2"]
  },
  "hr_analysis": {
    "initial_impression": "第一印象描述",
    "recommend_interview": 布尔值,
    "why_or_why_not": "推荐或不推荐的原因",
    "expression_issues": [
      {
        "original": "原始表述",
        "problem": "问题描述",
        "suggested": "建议表述"
      }
    ],
    "market_reminder": "市场趋势提醒"
  },
  "technical_analysis": {
    "trust_level": "low|medium|high",
    "red_flags": ["警示点1", "警示点2"],
    "expected_tech_questions": [
      {
        "project": "项目名称",
        "questions": ["问题1", "问题2"]
      }
    ],
    "technical_improvement": ["建议1", "建议2"],
    "project_deployment_verified": 布尔值,
    "data_complexity": "简单|中等|复杂"
  },
  "matchScore": 整数,
  "matchProbability": "低|中|高"
}

确保生成有效的JSON，不要有多余的反引号或注释。所有字段都必须有值。`;

    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 3500,
      response_format: { type: "json_object" }, // 指定返回JSON格式
    });

    // 解析JSON响应
    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
      return {
        rawAnalysis: response.choices[0].message.content,
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
          // 新增详细结构
          ats_analysis: result.ats_analysis || {},
          ranking_analysis: result.ranking_analysis || {},
          hr_analysis: result.hr_analysis || {},
          technical_analysis: result.technical_analysis || {},
        },
      };
    } catch (e) {
      console.error("JSON解析失败:", e);
      // 如果JSON解析失败，返回原始响应作为rawAnalysis
      return {
        rawAnalysis: response.choices[0].message.content,
        structured: {
          matchScore: 0,
          matchProbability: "未知",
          keyRequirements: [],
          strengths: [],
          weaknesses: [],
          possibleQuestions: [],
          improvementSuggestions: [],
          // 新增空结构
          ats_analysis: {},
          ranking_analysis: {},
          hr_analysis: {},
          technical_analysis: {},
        },
      };
    }
  } catch (error) {
    console.error("简历分析失败:", error);
    throw new Error("简历分析服务出现错误，请稍后再试");
  }
};

// 获取简历分析
const getAnalysisById = async (analysisId) => {
  try {
    // 使用正确的字段名称进行填充
    const analysis = await Analysis.findById(analysisId)
      .populate("userId", "name email") // 填充用户信息
      .populate("resumeId", "title content") // 填充简历信息
      .populate("jobId", "title company description"); // 填充职位信息

    if (!analysis) {
      throw new Error("分析结果不存在");
    }
    return analysis;
  } catch (error) {
    console.error("获取分析结果失败:", error);
    throw error;
  }
};

module.exports = {
  analyzeResumeMatch,
  getAnalysisById,
};
