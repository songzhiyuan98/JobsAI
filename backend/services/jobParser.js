const axios = require("axios");
require("dotenv").config();

// 添加预处理函数，清理原始JD文本
function preprocessJobText(jobText) {
  if (!jobText) return "";

  // 按行分割文本
  const lines = jobText.split("\n");
  const filteredLines = [];

  // 标记需要删除的行
  let skipSection = false;

  for (let line of lines) {
    const trimmedLine = line.trim();

    // 跳过公司评分部分
    if (trimmedLine.match(/^Company Rating|^[0-9](\.[0-9])? out of [0-9]/i)) {
      continue;
    }

    // 跳过"Do you have experience..."部分
    if (
      trimmedLine.match(/^Do you have experience|^Are you looking for a role/i)
    ) {
      continue;
    }

    // 跳过"Profile insights"部分
    if (
      trimmedLine.match(
        /^Profile insights|^Here's how the job aligns with your profile/i
      )
    ) {
      skipSection = true;
      continue;
    }

    // 下一个主要部分开始时结束跳过状态
    if (
      skipSection &&
      trimmedLine.match(
        /^Job Type|^Pay|^Location|^Benefits|^About the job|^Full job description/i
      )
    ) {
      skipSection = false;
    }

    // 如果不在跳过状态，则保留当前行
    if (!skipSection) {
      // 保留实质内容，跳过单纯的分隔符行
      if (trimmedLine && !trimmedLine.match(/^-+$|^\*+$/)) {
        filteredLines.push(line);
      }
    }
  }

  return filteredLines.join("\n");
}

async function parseJobDescription(jobText) {
  // 预处理JD文本
  const cleanedJobText = preprocessJobText(jobText);
  console.log("预处理后的JD文本长度:", cleanedJobText.length);

  const prompt = `
你是一位专业的职位描述解析助手。请将下方JD文本提取为结构化 JSON，字段和格式严格遵循如下 schema，所有字段都必须有值，缺失请用 "" 或 []，只返回有效 JSON，无解释、无注释、无代码块标记。

schema:
{
  "title": "",
  "company": "",
  "location": "",
  "job_type": "",
  "salary": "",
  "description": "",
  "requirements": [],
  "preferred_qualifications": [],
  "tech_stack": [],
  "benefits": []
}

原始JD文本：
${cleanedJobText}
`;

  try {
    console.log("正在通过 Gemini 解析职位描述...");
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        timeout: 20000, // 20秒超时
      }
    );

    let content =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // 健壮处理 markdown 代码块
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      content = codeBlockMatch[1];
    }
    content = content.trim();

    try {
      const parsedData = JSON.parse(content);
      return parsedData;
    } catch (jsonError) {
      console.error("JSON解析错误:", jsonError);
      console.error("原始响应:", content);
      throw new Error("无法解析Gemini返回的JSON数据");
    }
  } catch (error) {
    console.error("Gemini解析错误:", error);
    // 返回基本空结构
    return {
      title: "",
      company: "",
      location: "",
      job_type: "",
      salary: "",
      description: "",
      requirements: [],
      preferred_qualifications: [],
      tech_stack: [],
      benefits: [],
    };
  }
}

module.exports = { parseJobDescription, preprocessJobText };
