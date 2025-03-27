const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");

// 创建OpenAI实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  const prompt = `You are a professional resume parser.

Please read the raw resume text below and extract structured data in strict JSON format, using the following schema. All field names must match exactly, and use \`null\` or empty arrays where data is missing.

Return the result as **valid JSON only** — no explanation or comments.

Please ensure all property values follow standard JSON format with double quotes only.

Resume JSON schema:
\`\`\`json
{
  "basicInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "links": [
      {
        "type": "",
        "url": ""
      }
    ]
  },
  "education": [
    {
      "institution": "",
      "degree": "",
      "major": "",
      "gpa": 0,
      "startDate": null,
      "endDate": null,
      "courses": []
    }
  ],
  "experience": [
    {
      "company": "",
      "position": "",
      "location": "",
      "startDate": null,
      "endDate": null,
      "current": false,
      "instruction": "",
      "descriptions": []
    }
  ],
  "projects": [
    {
      "name": "",
      "instruction": "",
      "descriptions": [],
      "startDate": null,
      "endDate": null,
      "links": []
    }
  ],
  "skills": [
    {
      "category": "Programming Languages",
      "items": []
    },
    {
      "category": "Frameworks & Libraries",
      "items": []
    },
    {
      "category": "Databases, DevOps & Tools",
      "items": []
    }
  ],
  "honors": [
    {
      "title": "",
      "date": null
    }
  ]
}
\`\`\`

Now, extract structured resume data from the following plain text:

${resumeText}`;

  try {
    console.log("正在通过OpenAI解析简历...");

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    console.log("AI解析完成，正在验证JSON结构...");

    // 解析和验证JSON
    try {
      const parsedData = JSON.parse(responseContent);
      return parsedData;
    } catch (jsonError) {
      console.error("JSON解析错误:", jsonError);
      console.error("原始响应:", responseContent);
      throw new Error("无法解析AI返回的JSON数据");
    }
  } catch (error) {
    console.error("AI解析错误:", error);
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
