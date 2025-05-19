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

// AI服务通用工具函数
const axios = require("axios");

/**
 * 智能裁剪内容，保留最重要信息
 * @param {string} content 需要裁剪的内容
 * @param {number} maxLength 最大长度
 * @param {string} contentType 内容类型
 * @returns {string} 裁剪后的内容
 */
function truncateContent(content, maxLength = 6000, contentType = "generic") {
  if (content.length <= maxLength) return content;

  try {
    const obj = JSON.parse(content);

    // 职位描述特定优化
    if (contentType === "job") {
      // 保留最重要字段，完全不裁剪
      const criticalFields = ["title", "company", "position", "location"];

      // 中等程度裁剪字段
      if (obj.description && obj.description.length > 300) {
        obj.description = obj.description.substring(0, 300) + "...";
      }

      // 优先裁剪字段
      if (obj.requirements && Array.isArray(obj.requirements)) {
        obj.requirements = obj.requirements.slice(0, 5);
      }

      // 裁剪不太重要的详细字段
      if (obj.benefits && obj.benefits.length > 150) {
        obj.benefits = obj.benefits.substring(0, 150) + "...";
      }

      // 最低优先级字段，如果内容仍然过大可以完全移除
      if (JSON.stringify(obj).length > maxLength) {
        delete obj.additionalInfo;
        delete obj.companyDescription;
      }
    } else if (contentType === "resume") {
      // 保留的关键字段
      const criticalFields = [
        "name",
        "education",
        "skills",
        "projects",
        "technicalSkills",
        "workExperience",
      ];

      // 工作经历裁剪 - 保留最近和最相关的
      if (obj.workExperience && Array.isArray(obj.workExperience)) {
        // 最多保留3段工作经历
        obj.workExperience = obj.workExperience.slice(0, 3);

        // 精简每段工作经历的描述
        obj.workExperience.forEach((exp) => {
          if (exp.description && exp.description.length > 200) {
            exp.description = exp.description.substring(0, 200) + "...";
          }

          // 保留成就/责任中最重要的部分
          if (exp.achievements && Array.isArray(exp.achievements)) {
            exp.achievements = exp.achievements.slice(0, 3);
          }
        });
      }

      // 教育经历保留，但简化描述
      if (obj.education) {
        if (Array.isArray(obj.education)) {
          // 只保留最高学历
          obj.education = [obj.education[0]];
        }
        // 删除不必要的详细信息，但保留学校、专业和学位
      }

      // 技能部分保留，但可能需要精简
      if (obj.skills && Array.isArray(obj.skills)) {
        // 每类技能只保留最关键的几个
        obj.skills = obj.skills.slice(0, 10);
      }

      // 项目经历保留，但减少数量和简化描述
      if (obj.projects && Array.isArray(obj.projects)) {
        obj.projects = obj.projects.slice(0, 2); // 只保留最重要的2个项目
        obj.projects.forEach((proj) => {
          if (proj.description && proj.description.length > 150) {
            proj.description = proj.description.substring(0, 150) + "...";
          }
        });
      }

      // 可以完全移除的低优先级字段
      delete obj.summary; // 个人总结可以移除
      delete obj.interests; // 兴趣爱好可以移除
      delete obj.references; // 推荐人可以移除
      delete obj.certifications; // 证书如果不是特别重要可以移除
      delete obj.additionalInfo; // 额外信息可以移除
    }

    return JSON.stringify(obj);
  } catch (e) {
    // 更智能的文本裁剪...
  }
}

/**
 * 智能请求AI服务，支持自动裁剪和重试
 * @param {Object} options - 请求选项
 * @param {string} options.model - 使用的模型，如 "gemini-2.0-flash" 或 "gpt-4o"
 * @param {string} options.prompt - 提示词
 * @param {string} options.jobContent - 职位内容
 * @param {string} options.resumeContent - 简历内容
 * @param {number} options.maxRetries - 最大重试次数，默认2
 * @param {number} options.contentReductionPercent - 每次重试减少内容百分比，默认30%
 * @returns {Object} AI响应结果
 */
async function robustAIRequest(options) {
  const {
    model,
    prompt,
    jobContent,
    resumeContent,
    maxRetries = 2,
    contentReductionPercent = 30,
  } = options;

  let currentJobContent = jobContent;
  let currentResumeContent = resumeContent;
  let attempts = 0;
  let error = null;

  // 调试日志
  console.log(
    `[AIService] 开始请求 ${model}，内容长度：职位=${currentJobContent.length}，简历=${currentResumeContent.length}`
  );

  while (attempts <= maxRetries) {
    try {
      attempts++;

      // 替换提示词中的变量
      const fullPrompt = prompt
        .replace("{{jobStr}}", currentJobContent)
        .replace("{{resumeStr}}", currentResumeContent);

      // 根据不同模型发送请求
      if (model.startsWith("gemini")) {
        const response = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
          {
            contents: [
              {
                role: "user",
                parts: [{ text: fullPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 3500,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": process.env.GEMINI_API_KEY,
            },
            timeout: 60000, // 60秒超时
          }
        );

        const content =
          response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log(
          `[AIService] ${model} 请求成功，返回内容长度：${content.length}`
        );

        // 处理返回内容，提取JSON
        const json = extractJsonFromText(content);
        return {
          content,
          json,
          model,
        };
      } else {
        // OpenAI模型
        const response = await openai.chat.completions.create({
          model: model === "gpt-4o" ? "gpt-4o" : "gpt-3.5-turbo",
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.7,
          max_tokens: 3500,
          response_format:
            model === "gpt-4o" ? undefined : { type: "json_object" },
          timeout: 60000, // 60秒超时
        });

        const content = response.choices[0].message.content;
        console.log(
          `[AIService] ${model} 请求成功，返回内容长度：${content.length}`
        );

        // 处理返回内容，提取JSON
        const json = extractJsonFromText(content);
        return {
          content,
          json,
          model,
        };
      }
    } catch (err) {
      error = err;
      console.error(`[AIService] 第${attempts}次请求失败:`, err.message || err);

      if (attempts > maxRetries) break;

      // 计算下一次需要裁剪的长度
      const reductionFactor = contentReductionPercent / 100;

      // 对简历内容裁剪更激进一些
      let targetResumeLength = Math.floor(
        currentResumeContent.length * (1 - reductionFactor * 1.5)
      );
      // 对职位内容裁剪相对保守一些
      let targetJobLength = Math.floor(
        currentJobContent.length * (1 - reductionFactor * 0.8)
      );

      // 如果职位内容已经很短，优先裁剪简历
      if (
        currentJobContent.length < 1000 &&
        currentResumeContent.length > 3000
      ) {
        targetResumeLength = Math.floor(
          currentResumeContent.length * (1 - reductionFactor * 2)
        );
        targetJobLength = currentJobContent.length; // 尽量不裁剪职位
      }

      console.log(
        `[AIService] 裁剪内容后重试，目标长度：职位=${targetJobLength}，简历=${targetResumeLength}`
      );

      // 裁剪内容
      currentJobContent = truncateContent(
        currentJobContent,
        targetJobLength,
        "job"
      );
      currentResumeContent = truncateContent(
        currentResumeContent,
        targetResumeLength,
        "resume"
      );
    }
  }

  // 所有重试都失败
  throw new Error(`AI请求失败(${model})：${error?.message || "未知错误"}`);
}

/**
 * 从AI返回的文本中提取JSON
 * @param {string} text - AI返回的原始文本
 * @returns {Object} - 解析后的JSON对象
 */
function extractJsonFromText(text) {
  // 尝试解析Markdown代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let content = codeBlockMatch ? codeBlockMatch[1] : text;
  content = content.trim();

  // 尝试修复常见的JSON格式问题
  content = content
    // 修复未闭合的数组
    .replace(/,\s*]/g, "]")
    // 修复未闭合的对象
    .replace(/,\s*}/g, "}")
    // 修复多余的逗号
    .replace(/,(\s*[}\]])/g, "$1")
    // 修复可能的转义问题
    .replace(/\\"/g, '"')
    // 修复可能的换行问题
    .replace(/\n/g, " ")
    // 修复可能的制表符问题
    .replace(/\t/g, " ");

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error(
      "[AIService] JSON解析失败:",
      e,
      "原始内容:",
      content.substring(0, 200)
    );
    throw new Error("AI返回内容解析失败");
  }
}

module.exports = {
  generateInitialContext,
  generateAIResponse,
  extractQuestion,
  extractEvaluation,
  robustAIRequest,
  truncateContent,
  extractJsonFromText,
};
