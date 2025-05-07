const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const axios = require("axios");

/**
 * 从PDF简历文件中提取文本
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF文本提取错误:", error);
    throw new Error(`无法读取PDF文件: ${error.message}`);
  }
}

/**
 * 使用OpenAI API直接解析简历到完全匹配Resume模型的结构
 */
async function parseResumeToStructure(resumeText) {
  const prompt = `
你是一位专业的简历解析助手。请将下方原始简历文本提取为结构化 JSON，字段和格式严格遵循如下 schema，所有字段都必须有值，缺失请用 "" 或 []，只返回有效 JSON，无解释、无注释、无代码块标记。

schema:
{
  "basicInfo": { "fullName": "", "email": "", "phone": "", "location": "", "links": [] },
  "education": [ { "institution": "", "degree": "", "major": "", "gpa": 0, "startDate": null, "endDate": null, "courses": [] } ],
  "experience": [ { "company": "", "position": "", "location": "", "startDate": null, "endDate": null, "current": false, "instruction": "", "descriptions": [] } ],
  "projects": [ { "name": "", "instruction": "", "descriptions": [], "startDate": null, "endDate": null, "links": [] } ],
  "skills": [ { "category": "Programming Languages", "items": [] }, { "category": "Frameworks & Libraries", "items": [] }, { "category": "Databases, DevOps & Tools", "items": [] } ],
  "honors": [ { "title": "", "date": null } ]
}

原始简历文本：
${resumeText}
`;

  try {
    console.log("正在通过 Gemini 解析简历...");
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
          maxOutputTokens: 2500,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        timeout: 25000, // 25秒超时，防止卡死
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
      basicInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        links: [],
      },
      education: [],
      experience: [],
      projects: [],
      skills: [
        { category: "Programming Languages", items: [] },
        { category: "Frameworks & Libraries", items: [] },
        { category: "Databases, DevOps & Tools", items: [] },
      ],
      honors: [],
    };
  }
}

/**
 * 主函数：处理上传的简历文件
 */
async function processResumeFile(fileBuffer, originalFilename) {
  try {
    // 确保临时目录存在
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 创建临时文件
    const tempFilePath = path.join(tempDir, originalFilename);
    fs.writeFileSync(tempFilePath, fileBuffer);
    console.log(`临时文件已创建: ${tempFilePath}`);

    // 从PDF提取文本
    const resumeText = await extractTextFromPDF(tempFilePath);
    console.log(`提取的简历文本 (${resumeText.length} 字符)`);
    console.log(
      resumeText.substring(0, 500) + (resumeText.length > 500 ? "..." : "")
    );

    // 解析简历文本到结构化数据
    const structuredData = await parseResumeToStructure(resumeText);

    // 打印统计数据
    console.log("=== 解析结果统计 ===");
    console.log(
      `基本信息: ${structuredData.basicInfo.fullName ? "已提取" : "未提取"}`
    );
    console.log(`教育经历: ${structuredData.education.length}条`);
    console.log(`工作经验: ${structuredData.experience.length}条`);
    console.log(`项目经验: ${structuredData.projects.length}条`);

    let skillCount = 0;
    structuredData.skills.forEach((category) => {
      skillCount += category.items.length;
    });
    console.log(`技能项: ${skillCount}个`);
    console.log(`荣誉奖项: ${structuredData.honors.length}条`);

    // 添加原始文本和解析状态
    const result = {
      ...structuredData,
      rawText: resumeText,
    };

    // 清理临时文件
    fs.unlinkSync(tempFilePath);
    console.log(`临时文件已删除: ${tempFilePath}`);

    return result;
  } catch (error) {
    console.error("简历处理错误:", error);
    throw new Error(`简历处理失败: ${error.message}`);
  }
}

/**
 * 映射函数现在基本不需要，因为输出已直接符合Resume模型结构
 * 但保留此函数以便将来可能的调整
 */
function mapToResumeModel(parsedData) {
  if (!parsedData) return {};

  const result = JSON.parse(JSON.stringify(parsedData));

  // 直接删除links字段，避免验证错误
  if (result.basicInfo) {
    delete result.basicInfo.links;
  }

  return result;
}

module.exports = {
  processResumeFile,
  mapToResumeModel,
};
