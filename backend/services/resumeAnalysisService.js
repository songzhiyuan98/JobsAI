const OpenAI = require("openai");

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
    const systemPrompt = `你是一位经验丰富的HR分析专家，需要分析候选人简历与职位JD的匹配程度。请提供专业、详细的分析报告。

输入信息:
【职位信息】
${jobStr}

【候选人简历】
${resumeStr}

请提供以下分析内容:
1. 匹配度评分(0-100分)：给出一个总体匹配分数，并解释评分依据
2. JD关键需求解读：列出3-5个职位最关键的要求和技能
3. 简历优势分析：列出候选人简历中与职位匹配的3-5个优势
4. 简历不足分析：指出简历中的3-5个不足或与JD不匹配的地方
5. 面试可能性预测：预测HR邀请面试的概率(低/中/高)，并给出理由
6. 可能的面试问题：列出5-8个面试官可能会问的问题
7. 简历优化建议：提供3-5条具体建议，帮助候选人提高与该职位的匹配度

分析应当客观、专业，避免过度乐观或悲观的断言。请确保分析条理清晰，每个部分有明确的标题和分点说明。`;

    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const analysisResult = response.choices[0].message.content;

    // 尝试提取结构化数据
    const structuredData = extractStructuredData(analysisResult);

    return {
      rawAnalysis: analysisResult,
      structured: structuredData,
    };
  } catch (error) {
    console.error("简历分析失败:", error);
    throw new Error("简历分析服务出现错误，请稍后再试");
  }
};

/**
 * 从分析文本中提取结构化数据
 */
const extractStructuredData = (text) => {
  // 初始化结构化数据对象
  const data = {
    matchScore: 0,
    matchProbability: "未知",
    keyRequirements: [],
    strengths: [],
    weaknesses: [],
    possibleQuestions: [],
    improvementSuggestions: [],
  };

  try {
    // 提取匹配度评分
    const scoreMatch = text.match(/匹配度评分.*?(\d+)/i);
    if (scoreMatch && scoreMatch[1]) {
      data.matchScore = parseInt(scoreMatch[1], 10);
    }

    // 提取面试可能性
    if (
      text.includes("高") &&
      (text.includes("面试可能性") || text.includes("邀请面试的概率"))
    ) {
      data.matchProbability = "高";
    } else if (
      text.includes("中") &&
      (text.includes("面试可能性") || text.includes("邀请面试的概率"))
    ) {
      data.matchProbability = "中";
    } else if (
      text.includes("低") &&
      (text.includes("面试可能性") || text.includes("邀请面试的概率"))
    ) {
      data.matchProbability = "低";
    }

    // 提取关键需求
    const requirementsSection = text.match(
      /JD关键需求解读[：:]([\s\S]*?)(?=简历优势|$)/i
    );
    if (requirementsSection && requirementsSection[1]) {
      data.keyRequirements = extractListItems(requirementsSection[1]);
    }

    // 提取优势
    const strengthsSection = text.match(
      /简历优势[：:]([\s\S]*?)(?=简历不足|$)/i
    );
    if (strengthsSection && strengthsSection[1]) {
      data.strengths = extractListItems(strengthsSection[1]);
    }

    // 提取不足
    const weaknessesSection = text.match(
      /简历不足[：:]([\s\S]*?)(?=面试可能性|$)/i
    );
    if (weaknessesSection && weaknessesSection[1]) {
      data.weaknesses = extractListItems(weaknessesSection[1]);
    }

    // 提取可能的面试问题
    const questionsSection = text.match(
      /面试问题[：:]([\s\S]*?)(?=简历优化|$)/i
    );
    if (questionsSection && questionsSection[1]) {
      data.possibleQuestions = extractListItems(questionsSection[1]);
    }

    // 提取改进建议
    const suggestionsSection = text.match(/简历优化建议[：:]([\s\S]*?)$/i);
    if (suggestionsSection && suggestionsSection[1]) {
      data.improvementSuggestions = extractListItems(suggestionsSection[1]);
    }
  } catch (error) {
    console.error("结构化数据提取失败:", error);
  }

  return data;
};

/**
 * 从文本中提取列表项
 */
const extractListItems = (text) => {
  // 匹配数字或点开头的列表项
  const itemMatches = text.match(/(?:\d+\.|\d+\)|\-|\•|\*)\s*([^\n]+)/g);
  if (itemMatches) {
    // 移除列表标记，只保留内容
    return itemMatches
      .map((item) => item.replace(/^\s*(?:\d+\.|\d+\)|\-|\•|\*)\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
};

module.exports = {
  analyzeResumeMatch,
};
