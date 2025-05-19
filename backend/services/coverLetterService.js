const {
  coverLetterGeminiPrompt,
  coverLetterGpt4oPrompt,
} = require("./aiCoverLetterPrompts");
const PDFDocument = require("pdfkit");
const OpenAI = require("openai");
const axios = require("axios");
const { robustAIRequest, extractJsonFromText } = require("./aiService");

// OpenAI 客户端
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 生成求职信内容
exports.generateCoverLetter = async ({ job, resume, model }) => {
  let prompt, parsed;

  console.log("[CoverLetterService] 请求模型:", model);
  console.log(
    "[CoverLetterService] 内容长度: 职位=",
    JSON.stringify(job).length,
    "简历=",
    JSON.stringify(resume).length
  );

  try {
    if (model === "gpt-4o") {
      prompt = coverLetterGpt4oPrompt;
      console.log("[CoverLetterService] 使用gpt4o prompt");
      console.log("[CoverLetterService] gpt4o prompt长度:", prompt.length);

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
              .replace("{{job.title}}", job.title || "")
              .replace("{{job.company}}", job.company || "")
              .replace("{{job.location}}", job.location || "")
              .replace("{{job.description}}", job.description || "")
              .replace(
                "{{job.requirements}}",
                JSON.stringify(job.requirements || [])
              )
              .replace(
                "{{job.preferred_qualifications}}",
                JSON.stringify(job.preferred_qualifications || [])
              )
              .replace(
                "{{job.tech_stack}}",
                JSON.stringify(job.tech_stack || [])
              )
              .replace("{{job.companyInfo}}", job.companyInfo || "")
              .replace(
                "{{resume.basicInfo}}",
                JSON.stringify(resume.basicInfo || {})
              )
              .replace(
                "{{resume.education}}",
                JSON.stringify(resume.education || [])
              )
              .replace(
                "{{resume.experiences}}",
                JSON.stringify(resume.experiences || [])
              )
              .replace(
                "{{resume.projects}}",
                JSON.stringify(resume.projects || [])
              )
              .replace(
                "{{resume.skills}}",
                JSON.stringify(resume.skills || [])
              ),
          },
        ],
        temperature: 0.7,
      });

      const aiResult = completion.choices[0].message.content;
      console.log(
        "[CoverLetterService] gpt4o 请求成功，返回长度:",
        aiResult.length
      );
      parsed = extractJsonFromText(aiResult);
    } else if (model.startsWith("gemini")) {
      prompt = coverLetterGeminiPrompt;
      console.log("[CoverLetterService] 使用gemini prompt");
      console.log("[CoverLetterService] gemini prompt长度:", prompt.length);

      // 替换提示词中的变量
      const formattedPrompt = prompt
        .replace("{{job.title}}", job.title || "")
        .replace("{{job.company}}", job.company || "")
        .replace("{{job.location}}", job.location || "")
        .replace("{{job.description}}", job.description || "")
        .replace("{{job.requirements}}", JSON.stringify(job.requirements || []))
        .replace(
          "{{job.preferred_qualifications}}",
          JSON.stringify(job.preferred_qualifications || [])
        )
        .replace("{{job.tech_stack}}", JSON.stringify(job.tech_stack || []))
        .replace("{{job.companyInfo}}", job.companyInfo || "")
        .replace("{{resume.basicInfo}}", JSON.stringify(resume.basicInfo || {}))
        .replace("{{resume.education}}", JSON.stringify(resume.education || []))
        .replace(
          "{{resume.experiences}}",
          JSON.stringify(resume.experiences || [])
        )
        .replace("{{resume.projects}}", JSON.stringify(resume.projects || []))
        .replace("{{resume.skills}}", JSON.stringify(resume.skills || []));

      console.log("[CoverLetterService] gemini prompt:", formattedPrompt);

      // 使用增强版请求函数
      const aiResponse = await robustAIRequest({
        model,
        prompt: formattedPrompt,
        jobContent: JSON.stringify(job),
        resumeContent: JSON.stringify(resume),
        contentTypes: { job: "job", resume: "resume" },
        maxRetries: 2,
        contentReductionPercent: 30,
      });

      console.log("[CoverLetterService] gemini 请求成功");
      parsed = aiResponse.json;
    } else {
      throw new Error("不支持的模型类型");
    }

    // 字段兜底
    return {
      recipient: parsed.recipient || "",
      subject: parsed.subject || "",
      paragraphs: parsed.paragraphs || [],
      closing: parsed.closing || "",
      signature: parsed.signature || "",
      highlights: parsed.highlights || [],
      suggestions: parsed.suggestions || [],
    };
  } catch (error) {
    console.error("[CoverLetterService] 生成失败:", error);
    throw new Error(`求职信生成失败: ${error.message}`);
  }
};

// 生成 PDF 并 pipe 到 res（只保留正文）
exports.generateCoverLetterPdf = async (coverLetter, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 60 });
  // 标题
  doc.fontSize(18).font("Helvetica-Bold").text(coverLetter.subject, {
    align: "center",
  });
  doc.moveDown(2);

  // 收件人
  doc.fontSize(12).font("Helvetica").text(`收件人：${coverLetter.recipient}`);
  doc.moveDown();

  // 正文段落
  (coverLetter.paragraphs || []).forEach((p) => {
    doc.fontSize(12).text(p, { paragraphGap: 10, lineGap: 4 });
    doc.moveDown(0.5);
  });

  // 结尾敬语
  doc.moveDown();
  doc.fontSize(12).text(coverLetter.closing);

  // 签名
  doc.moveDown(2);
  doc.fontSize(12).text(coverLetter.signature, { align: "right" });

  doc.end();
  doc.pipe(res);
};
