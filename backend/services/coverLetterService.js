const {
  coverLetterGeminiPrompt,
  coverLetterGpt4oPrompt,
} = require("./aiCoverLetterPrompts");
const PDFDocument = require("pdfkit");
const OpenAI = require("openai");
const axios = require("axios");

// OpenAI 客户端
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 健壮提取 Gemini 返回的 JSON
function extractGeminiJson(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let content = codeBlockMatch ? codeBlockMatch[1] : text;
  content = content.trim();
  return JSON.parse(content);
}

// 健壮提取 AI 返回的 JSON（支持 markdown 代码块，gpt-4o 专用）
function extractJsonFromText(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let content = codeBlockMatch ? codeBlockMatch[1] : text;
  content = content.trim();
  return JSON.parse(content);
}

// 生成求职信内容（完全照搬简历分析的结构）
exports.generateCoverLetter = async ({ job, resume, model }) => {
  const jobStr = JSON.stringify(job, null, 2);
  const resumeStr = JSON.stringify(resume, null, 2);

  let prompt, aiResult, parsed;

  console.log("[CoverLetterService] jobStr:", jobStr.slice(0, 100));
  console.log("[CoverLetterService] resumeStr:", resumeStr.slice(0, 100));

  if (model === "gpt-4o") {
    prompt = coverLetterGpt4oPrompt
      .replace("{{jobStr}}", jobStr)
      .replace("{{resumeStr}}", resumeStr);
    console.log("[CoverLetterService] gpt4o prompt:", prompt.slice(0, 200));
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      aiResult = completion.choices[0].message.content;
      console.log(
        "[CoverLetterService] gpt4o AI原始返回:",
        aiResult.slice(0, 300)
      );
      parsed = extractJsonFromText(aiResult);
      console.log("[CoverLetterService] gpt4o 解析后:", parsed);
    } catch (e) {
      console.error("[CoverLetterService] gpt4o 解析异常:", e, aiResult);
      throw new Error("GPT-4o 返回内容解析失败，请重试");
    }
  } else if (model.startsWith("gemini")) {
    prompt = coverLetterGeminiPrompt
      .replace("{{jobStr}}", jobStr)
      .replace("{{resumeStr}}", resumeStr);
    console.log("[CoverLetterService] gemini prompt:", prompt.slice(0, 200));
    try {
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
            temperature: 0.7,
            maxOutputTokens: 3500,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
        }
      );
      let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log(
        "[CoverLetterService] gemini AI原始返回:",
        text.slice(0, 300)
      );
      // 健壮处理 markdown 代码块
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) {
        text = codeBlockMatch[1];
      }
      text = text.trim();
      parsed = JSON.parse(text);
      console.log("[CoverLetterService] gemini 解析后:", parsed);
    } catch (e) {
      console.error("[CoverLetterService] Gemini JSON解析失败:", e);
      throw new Error("Gemini 返回内容解析失败，请重试");
    }
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
