const Interview = require("../models/Interview");
const Session = require("../models/Session");
const User = require("../models/User");
const {
  generateInitialContext,
  generateAIResponse,
} = require("../services/aiService");
const UserJob = require("../models/UserJob");
const Resume = require("../models/Resume");

/**
 * 创建新面试并初始化会话
 */
const createInterview = async (req, res) => {
  try {
    const { jobId, resumeId, settings } = req.body;
    const userId = req.user.id;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: "职位ID和简历ID不能为空",
      });
    }

    // 查询职位和简历完整信息
    const job = await UserJob.findById(jobId);
    const resume = await Resume.findById(resumeId);

    if (!job || !resume) {
      return res.status(404).json({
        success: false,
        message: "找不到指定的职位或简历",
      });
    }

    // 创建面试记录
    const interview = new Interview({
      user: userId,
      job: jobId,
      resume: resumeId,
      status: "active",
      settings: settings || {
        maxRounds: 10,
        language: "zh-CN",
        difficulty: "medium",
      },
      startTime: new Date(),
    });

    await interview.save();

    // 2. 生成初始上下文
    const initialContext = await generateInitialContext(job, resume, settings);

    // 3. 创建面试会话
    const session = new Session({
      interview: interview._id,
      user: userId,
      messages: [
        {
          role: "system",
          content: initialContext.systemPrompt,
        },
        {
          role: "assistant",
          content: initialContext.welcomeMessage,
        },
      ],
      context: {
        job: job,
        resume: resume,
        currentRound: 0,
        maxRounds: settings?.maxRounds || 10,
        askedQuestions: [],
        evaluatedSkills: {},
        interviewProgress: 0,
        remainingTime: settings?.maxTime || 1800, // 默认30分钟
      },
    });

    await session.save();

    // 4. 更新面试记录，关联会话
    interview.currentSession = session._id;
    await interview.save();

    // 5. 返回结果
    return res.status(201).json({
      success: true,
      data: {
        _id: interview._id,
        sessionId: session._id,
      },
      message: "面试创建成功",
    });
  } catch (error) {
    console.error("创建面试失败:", error);
    return res.status(500).json({
      success: false,
      message: "创建面试失败，请重试",
    });
  }
};

/**
 * 发送消息并获取AI回复
 */
const sendMessage = async (req, res) => {
  try {
    const { interviewId, message } = req.body;
    const userId = req.user.id;

    if (!interviewId || !message) {
      return res.status(400).json({
        success: false,
        message: "面试ID和消息内容不能为空",
      });
    }

    // 查找面试记录和当前会话
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "找不到指定的面试",
      });
    }

    if (interview.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "您无权访问此面试",
      });
    }

    // 获取当前会话
    const session = await Session.findById(interview.currentSession);

    // 将用户消息添加到会话历史
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // 更新会话上下文
    session.context.currentRound += 1;
    if (session.context.currentRound >= session.context.maxRounds) {
      session.context.interviewProgress = 100;
    } else {
      session.context.interviewProgress =
        (session.context.currentRound / session.context.maxRounds) * 100;
    }

    await session.save();

    // 调用AI服务获取回复
    const aiResponse = await generateAIResponse(session);

    // 将AI回复添加到会话历史
    session.messages.push({
      role: "assistant",
      content: aiResponse.message,
      timestamp: new Date(),
    });

    // 更新上下文中的已问问题和评估技能
    if (aiResponse.metadata) {
      if (aiResponse.metadata.question) {
        session.context.askedQuestions.push(aiResponse.metadata.question);
      }

      if (aiResponse.metadata.evaluatedSkills) {
        session.context.evaluatedSkills = {
          ...session.context.evaluatedSkills,
          ...aiResponse.metadata.evaluatedSkills,
        };
      }
    }

    // 检查面试是否结束
    if (
      session.context.interviewProgress >= 100 ||
      aiResponse.isInterviewComplete
    ) {
      interview.status = "completed";
      interview.endTime = new Date();
    }

    await session.save();
    await interview.save();

    // 返回更新后的消息和元数据
    return res.status(200).json({
      success: true,
      data: {
        message: aiResponse.message,
        progress: session.context.interviewProgress,
        round: session.context.currentRound,
        isComplete: interview.status === "completed",
      },
    });
  } catch (error) {
    console.error("面试消息处理错误:", error);
    return res.status(500).json({
      success: false,
      message: "处理面试消息失败，请重试",
    });
  }
};

/**
 * 获取面试详情及消息历史
 */
const getInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.user.id;

    const interview = await Interview.findById(interviewId)
      .populate("job")
      .populate("resume");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "找不到指定的面试",
      });
    }

    if (interview.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "您无权访问此面试",
      });
    }

    // 获取相关会话
    const session = await Session.findById(interview.currentSession);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "找不到面试会话",
      });
    }

    // 计算进度
    const progress = Math.min(
      (session.context.currentRound / session.context.maxRounds) * 100,
      100
    );

    return res.status(200).json({
      success: true,
      data: {
        interview: interview,
        messages: session.messages,
        progress: progress,
        currentRound: session.context.currentRound,
        maxRounds: session.context.maxRounds,
      },
    });
  } catch (error) {
    console.error("获取面试详情失败:", error);
    return res.status(500).json({
      success: false,
      message: "获取面试详情失败，请重试",
    });
  }
};

module.exports = {
  createInterview,
  sendMessage,
  getInterview,
  // 其他面试控制器方法
};
