import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiDownload,
  FiShare2,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiBarChart2,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";

const InterviewSummaryPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/interviews/${interviewId}/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setSummary(response.data.data.summary);
          setInterview(response.data.data.interview);
        }
      } catch (err) {
        setError(
          "获取面试总结失败: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [interviewId]);

  // 获取评分对应的颜色和图标
  const getScoreColor = (score) => {
    if (score >= 80)
      return {
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <FiCheckCircle />,
      };
    if (score >= 60)
      return {
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: <FiAlertCircle />,
      };
    return {
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: <FiXCircle />,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-xl">
          <h2 className="text-xl font-semibold mb-2">出错了</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            返回仪表板
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg max-w-xl">
          <h2 className="text-xl font-semibold mb-2">面试总结尚未生成</h2>
          <p>面试可能还未完成或系统正在生成总结报告。</p>
          <button
            onClick={() => navigate(`/interview/${interviewId}`)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            返回面试
          </button>
        </div>
      </div>
    );
  }

  const { overallScore } = summary;
  const scoreDetails = getScoreColor(overallScore);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 头部导航 */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            面试总结报告
          </h1>
          <div className="ml-auto flex space-x-2">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2">
              <FiDownload className="text-xl" />
            </button>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2">
              <FiShare2 className="text-xl" />
            </button>
          </div>
        </div>

        {/* 面试信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 职位信息 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <FiBriefcase className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  职位
                </h3>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {interview?.job?.title || "职位信息"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {interview?.job?.company || "公司名称"}
                </p>
              </div>
            </div>

            {/* 候选人信息 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <FiUser className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  候选人
                </h3>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {interview?.resume?.name || "候选人姓名"}
                </p>
              </div>
            </div>

            {/* 总体评分 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 ${scoreDetails.bgColor} rounded-full flex items-center justify-center`}
                >
                  <span className={scoreDetails.color}>
                    {scoreDetails.icon}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  总体评分
                </h3>
                <p className={`text-base font-medium ${scoreDetails.color}`}>
                  {overallScore} / 100
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {summary.recommendation || "暂无推荐"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 评分结果图表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center mb-4">
            <FiBarChart2 className="text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              技能评估
            </h2>
          </div>

          <div className="space-y-4">
            {summary.skillScores &&
              Object.entries(summary.skillScores).map(([skill, score]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {skill}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        score >= 80
                          ? "bg-green-500"
                          : score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 面试总结 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            总体评价
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                优势
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {summary.strengths &&
                  summary.strengths.map((strength, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">
                      {strength}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                需要改进
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {summary.weaknesses &&
                  summary.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">
                      {weakness}
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                面试官评语
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {summary.comments || "暂无评语"}
              </p>
            </div>
          </div>
        </div>

        {/* 面试问答记录 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            面试问答记录
          </h2>

          <div className="space-y-6">
            {summary.questions &&
              summary.questions.map((qa, index) => (
                <div
                  key={index}
                  className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="mb-3">
                    <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      问题 {index + 1}: {qa.question}
                    </h3>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        qa.score >= 80
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : qa.score >= 60
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      } ml-2`}
                    >
                      {qa.score} 分
                    </div>
                  </div>

                  <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-3">
                      {qa.answer || "未回答"}
                    </p>

                    {qa.feedback && (
                      <div className="mt-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-md p-3">
                        <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">
                          面试官点评
                        </h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                          {qa.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 px-5 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            返回仪表板
          </button>
          <button
            onClick={() => navigate("/interview/start")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            开始新面试
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSummaryPage;
