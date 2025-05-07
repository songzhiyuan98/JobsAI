const CoverLetter = require("../models/CoverLetter");
const {
  generateCoverLetter,
  generateCoverLetterPdf,
} = require("../services/coverLetterService");

// 创建求职信
exports.createCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobId, model } = req.body;
    console.log("[CoverLetterController] resumeId:", resumeId);
    console.log("[CoverLetterController] jobId:", jobId);
    console.log("[CoverLetterController] model:", model);
    const userId = req.user.id;

    // 查找简历和职位
    const job = await require("../models/UserJob").findById(jobId);
    const resume = await require("../models/Resume").findById(resumeId);
    if (!job || !resume)
      return res
        .status(404)
        .json({ success: false, message: "职位或简历不存在" });
    if (resume.user.toString() !== userId)
      return res
        .status(403)
        .json({ success: false, message: "无权访问该简历" });

    // 生成求职信内容
    console.log("[CoverLetterController] 生成求职信内容...");
    const coverLetterData = await generateCoverLetter({ job, resume, model });

    // 写入数据库
    const doc = await CoverLetter.create({
      userId,
      resumeId,
      jobId,
      ...coverLetterData,
      model,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 获取单个求职信
exports.getCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const doc = await CoverLetter.findById(id)
      .populate("jobId", "title company")
      .populate("resumeId", "name");
    if (!doc)
      return res.status(404).json({ success: false, message: "未找到求职信" });
    if (doc.userId.toString() !== userId)
      return res.status(403).json({ success: false, message: "无权访问" });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 获取当前用户所有求职信
exports.getUserCoverLetters = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.query;
    const query = { userId };
    if (jobId) query.jobId = jobId;
    const docs = await CoverLetter.find(query)
      .populate("jobId", "title company")
      .populate("resumeId", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 下载求职信 PDF
exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const doc = await CoverLetter.findById(id)
      .populate("jobId", "title company")
      .populate("resumeId", "name");
    if (!doc)
      return res.status(404).json({ success: false, message: "未找到求职信" });
    if (doc.userId.toString() !== userId)
      return res.status(403).json({ success: false, message: "无权访问" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=coverletter.pdf`
    );
    await generateCoverLetterPdf(doc, res); // 直接 pipe 到 res
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
