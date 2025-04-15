import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiX,
  FiExternalLink,
  FiFileText,
  FiAlertCircle,
  FiLoader,
  FiCalendar,
  FiUser,
  FiPercent,
  FiEye,
  FiBriefcase,
  FiAward,
  FiPlusCircle,
  FiZap,
} from "react-icons/fi";

const AnalysisReportsList = ({ jobId, jobTitle, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/analysis/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setReports(response.data.data);
        } else {
          setError(response.data.message || "获取分析报告失败");
        }
      } catch (err) {
        console.error("获取分析报告错误:", err);
        setError(
          "无法获取分析报告: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [jobId]);

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 查看简历详情
  const handleViewResume = (resumeId, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    navigate(`/resumes/${resumeId}`);
  };

  // 前往一键分析页面
  const handleQuickAnalysis = () => {
    navigate(
      `/analysis/start?jobId=${jobId}&jobTitle=${encodeURIComponent(jobTitle)}`
    );
    onClose(); // 关闭当前模态框
  };

  // 匹配分数展示
  const renderMatchScore = (score) => {
    let bgColor = "bg-gray-100 dark:bg-gray-700";
    let textColor = "text-gray-800 dark:text-gray-300";

    if (score >= 80) {
      bgColor = "bg-green-100 dark:bg-green-900/30";
      textColor = "text-green-800 dark:text-green-300";
    } else if (score >= 60) {
      bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
      textColor = "text-yellow-800 dark:text-yellow-300";
    } else if (score >= 0) {
      bgColor = "bg-red-100 dark:bg-red-900/30";
      textColor = "text-red-800 dark:text-red-300";
    }

    return (
      <div
        className={`flex items-center ${bgColor} ${textColor} px-3 py-2 rounded-lg`}
      >
        <FiPercent className="mr-2" />
        <span className="font-medium text-lg">{score}%</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiFileText className="mr-3 text-indigo-500" />
              分析报告一览
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              <FiBriefcase className="inline-block mr-1" />
              职位："{jobTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* 一键分析按钮区域 */}
        <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-indigo-700 dark:text-indigo-300">
                想要分析新简历？
              </h4>
              <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mt-1">
                一键分析您的简历与这个职位的匹配度
              </p>
            </div>
            <button
              onClick={handleQuickAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center"
            >
              <FiZap className="mr-2" />
              一键分析新简历
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-5">
              <div className="flex">
                <FiAlertCircle className="text-red-500 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FiLoader className="animate-spin text-indigo-500 h-10 w-10 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                加载分析报告...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <FiFileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无分析报告
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                您还没有针对这个职位的分析报告。点击上方"一键分析新简历"按钮开始分析。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => navigate(`/analysis/${report._id}`)}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all duration-200 hover:shadow-md group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {report.resume?.basicInfo?.name || "未命名简历"}
                            <FiExternalLink className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4" />
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            分析报告 #{report._id.substring(18)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {renderMatchScore(report.matchScore)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <FiUser className="mr-2 text-gray-400" />
                          <span>
                            {report.resume?.basicInfo?.title || "未知职位"}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <FiCalendar className="mr-2 text-gray-400" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <FiAward className="mr-2 text-gray-400" />
                          <span>
                            排名前{" "}
                            {100 -
                              (report.ranking_analysis
                                ?.predicted_rank_percentile || 0)}
                            %
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                          {report.resume?.basicInfo?.headline ||
                            report.resume?.basicInfo?.summary?.substring(
                              0,
                              120
                            ) + "..." ||
                            "点击查看完整分析报告..."}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-between">
                        <div className="flex space-x-2">
                          <div className="text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 flex items-center">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-0.5 rounded mr-2">
                              ATS得分
                            </span>
                            {report.ats_analysis?.match_score_percent || 0}%
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 flex items-center">
                            <span
                              className={`${
                                report.hr_analysis?.recommend_interview
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              } text-xs px-2 py-0.5 rounded mr-2`}
                            >
                              HR建议
                            </span>
                            {report.hr_analysis?.recommend_interview
                              ? "推荐面试"
                              : "不推荐"}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleViewResume(report.resumeId, e)}
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center text-sm transition-colors"
                        >
                          <FiEye className="mr-1" />
                          预览简历
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            共找到 {reports.length} 个分析报告
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportsList;
