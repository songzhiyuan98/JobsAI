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

  const prompt = `You are a professional job description parser.

Please analyze the following job post text and extract the following fields in valid JSON format.  
All values must be extracted from the text, and fields should not be invented.  
If a field is not available, return an empty string or empty array.  
Return **valid and parsable JSON only**, no explanation, no comments.

Fields to extract:
- title: Job title
- company: Company name
- location: Work location (e.g. city, state, remote, hybrid)
- job_type: Type of job (e.g. full-time, part-time, contract)
- salary: Salary or hourly rate (e.g. "$40 per hour", "$100k-$120k/year")
- description: Short paragraph summarizing the job
- requirements: List of required qualifications or skills
- preferred_qualifications: List of preferred qualifications or "nice to have"
- tech_stack: Array of programming languages, tools, or frameworks mentioned
- benefits: List of company benefits (if mentioned)

Job Post Text:
""" 
${cleanedJobText}
"""

Respond ONLY with a valid JSON object matching the structure above.`;

  try {
    console.log("正在通过OpenAI解析职位描述...");

    const openai = new axios.create({
      baseURL: "https://api.openai.com/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const completion = await openai.post("/chat/completions", {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.data.choices[0].message.content;
    console.log("AI解析完成，正在验证JSON结构...");

    try {
      const parsedData = JSON.parse(responseContent);
      return parsedData;
    } catch (jsonError) {
      throw new Error("无法解析AI返回的JSON数据");
    }
  } catch (error) {
    console.error("AI解析错误:", error);
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
