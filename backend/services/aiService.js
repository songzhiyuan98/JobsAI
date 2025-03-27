const OpenAI = require("openai");
// 或者如果使用ES模块，则使用:
// import OpenAI from "openai";

// 创建OpenAI客户端实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 从环境变量中获取API密钥
});

/**
 * 根据职位和简历生成面试初始上下文
 */
const generateInitialContext = async (job, resume, settings) => {
  // 将整个job和resume对象转换为字符串
  const jobStr = JSON.stringify(job, null, 2);
  const resumeStr = JSON.stringify(resume, null, 2);

  // 3. 构建系统提示词
  const systemPrompt = `
你是一位经验丰富的软件工程师，正在担任技术面试官。你需要评估候选人是否适合申请的职位。

【职位信息】
${jobStr}

【候选人简历】
${resumeStr}

---
你的任务是通过提问评估候选人的技术能力、问题解决能力和沟通技巧。遵循以下指导:

1. 提问全面但有针对性，重点关注职位所需的关键技能
2. 问题难度适中，从简单到复杂
3. 针对候选人的回答进行适当的追问，最多2-3个跟进问题
4. 在最后一轮面试后，提供全面评估包括:
   - 总体得分(0-100)
   - 是否推荐录用(推荐/谨慎推荐/不推荐)
   - 优势(3-5点)
   - 需要改进的地方(3-5点)
   - 针对不同技能的评分(各项0-100)

请以友好专业的态度进行面试，每次只问一个问题，等待回答。面试共${
    settings?.maxRounds || 10
  }轮。确保候选人能充分展示自己的能力。

面试现在开始。`;

  // 4. 构建欢迎消息
  // 尝试从简历中提取候选人姓名，如果不存在则使用默认值
  const candidateName = resume.basic_info?.fullName || resume.name || "候选人";
  const jobTitle = job.title || job.position || "申请的职位";

  const welcomeMessage = `你好${
    candidateName ? " " + candidateName : ""
  }！我是今天的面试官，我们将进行一次关于${jobTitle}职位的技术面试。面试将持续大约${
    settings?.maxRounds || 10
  }个问题，请放松并准备好回答第一个问题。`;

  return {
    systemPrompt,
    welcomeMessage,
  };
};

/**
 * 根据会话历史和上下文生成AI回复
 */
const generateAIResponse = async (session) => {
  try {
    // 构建消息历史
    const messages = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 获取面试上下文
    const { job, resume, currentRound, maxRounds, askedQuestions } =
      session.context;

    // 如果是最后一轮，添加总结提示
    if (currentRound >= maxRounds - 1) {
      messages.push({
        role: "system",
        content: `这是最后一个问题了。问完这个问题后，请给出本次面试的总体评价，包括候选人的优势、需要改进的地方，以及是否推荐录用。`,
      });
    }

    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // 或者其他适合的模型
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiMessage = response.choices[0].message.content;

    // 解析元数据（如果是最后一轮，尝试提取评估结果）
    let metadata = {};
    let isInterviewComplete = currentRound >= maxRounds;

    if (isInterviewComplete) {
      // 尝试从回复中提取结构化的评价信息
      metadata = extractEvaluation(aiMessage);
    } else {
      // 提取当前问题，供跟踪使用
      metadata.question = extractQuestion(aiMessage);
    }

    return {
      message: aiMessage,
      metadata: metadata,
      isInterviewComplete: isInterviewComplete,
    };
  } catch (error) {
    console.error("生成AI回复失败:", error);
    // 返回一个友好的错误消息
    return {
      message: "抱歉，我现在无法继续面试。请稍后再试或联系技术支持。",
      metadata: {},
      isInterviewComplete: false,
    };
  }
};

/**
 * 从AI回复中提取问题
 * @param {string} message - AI的回复消息
 * @returns {string} 提取的问题
 */
const extractQuestion = (message) => {
  // 简单实现：假设问题通常在消息的末尾，以问号结束
  const questionMatches = message.match(/([^.!?]+\?)/g);
  if (questionMatches && questionMatches.length > 0) {
    // 返回最后一个问号结尾的句子作为问题
    return questionMatches[questionMatches.length - 1].trim();
  }

  // 如果没有问号，尝试提取可能是问题的最后一句话
  const sentences = message.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 0) {
    return sentences[sentences.length - 1].trim();
  }

  return "未能提取问题";
};

/**
 * 从AI的最终评估回复中提取结构化评估信息
 * @param {string} message - AI的评估消息
 * @returns {Object} 结构化的评估数据
 */
const extractEvaluation = (message) => {
  // 初始化评估结果对象
  const evaluation = {
    overallScore: 0,
    recommendation: "未指定",
    strengths: [],
    improvements: [],
    skillScores: {},
  };

  try {
    // 尝试提取总体分数
    const scoreMatch = message.match(/总体得分[：:]\s*(\d+)/i);
    if (scoreMatch && scoreMatch[1]) {
      evaluation.overallScore = parseInt(scoreMatch[1], 10);
    }

    // 尝试提取推荐状态
    if (message.includes("推荐录用") || message.includes("强烈推荐")) {
      evaluation.recommendation = "推荐";
    } else if (message.includes("谨慎推荐")) {
      evaluation.recommendation = "谨慎推荐";
    } else if (message.includes("不推荐")) {
      evaluation.recommendation = "不推荐";
    }

    // 尝试提取优势
    const strengthsSection = message.match(
      /优势[：:]([\s\S]*?)(?=需要改进|改进之处|不足之处|$)/i
    );
    if (strengthsSection && strengthsSection[1]) {
      const strengths = strengthsSection[1]
        .split(/\d+\.|\-/)
        .filter((s) => s.trim().length > 0);
      evaluation.strengths = strengths.map((s) => s.trim());
    }

    // 尝试提取需要改进的地方
    const improvementsSection = message.match(
      /(?:需要改进|改进之处|不足之处)[：:]([\s\S]*?)(?=技能评分|总结|$)/i
    );
    if (improvementsSection && improvementsSection[1]) {
      const improvements = improvementsSection[1]
        .split(/\d+\.|\-/)
        .filter((s) => s.trim().length > 0);
      evaluation.improvements = improvements.map((s) => s.trim());
    }

    // 尝试提取技能评分
    const skillScoreMatches = message.match(
      /([^:：]+)[：:]\s*(\d+)(?:\s*分)?/g
    );
    if (skillScoreMatches) {
      skillScoreMatches.forEach((match) => {
        const parts = match.split(/[：:]/);
        if (parts.length === 2) {
          const skill = parts[0].trim();
          const scoreMatch = parts[1].match(/\d+/);
          if (scoreMatch) {
            const score = parseInt(scoreMatch[0], 10);
            // 排除总体得分，只保留技能得分
            if (
              skill !== "总体得分" &&
              skill !== "总分" &&
              !skill.includes("总体")
            ) {
              evaluation.skillScores[skill] = score;
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("提取评估数据失败:", error);
  }

  return evaluation;
};

module.exports = {
  generateInitialContext,
  generateAIResponse,
  extractQuestion,
  extractEvaluation,
};
