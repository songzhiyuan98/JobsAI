import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiTrash,
  FiEye,
  FiLoader,
  FiAlertTriangle,
  FiBarChart2,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";

const AnalysisHistorySection = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data.data);
    } catch (err) {
      setError("获取分析报告失败");
      console.error("获取分析报告错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除这份分析报告吗？此操作不可撤销。")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.filter((report) => report._id !== id));
    } catch (err) {
      console.error("删除分析报告失败:", err);
      alert("删除失败，请重试");
    }
  };

  const handleViewReport = (report) => {
    const modelType = report.model?.toLowerCase() || "gemini";
    if (modelType.includes("gpt4")) {
      navigate(`/analysis/gpt4o/${report._id}`);
    } else {
      navigate(`/analysis/gemini/${report._id}`);
    }
  };

  const getModelIcon = (model) => {
    if (!model) return <FiFileText className="h-4 w-4" />;

    const modelType = model.toLowerCase();
    if (modelType.includes("gpt4")) {
      return <FiTarget className="h-4 w-4" />;
    } else if (modelType.includes("gemini")) {
      return <FiTrendingUp className="h-4 w-4" />;
    }
    return <FiBarChart2 className="h-4 w-4" />;
  };

  const getModelColor = (model) => {
    if (!model) return "text-gray-600 dark:text-gray-400";

    const modelType = model.toLowerCase();
    if (modelType.includes("gpt4")) {
      return "text-purple-600 dark:text-purple-400";
    } else if (modelType.includes("gemini")) {
      return "text-blue-600 dark:text-blue-400";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  const getReportTypeIcon = (report) => {
    if (report.gapAnalysis || report.opportunityHighlights) {
      return <FiCheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (report.ats_analysis || report.technical_analysis) {
      return <FiTarget className="h-4 w-4 text-blue-500" />;
    }
    return <FiFileText className="h-4 w-4 text-gray-500" />;
  };

  const getReportTitle = (report) => {
    if (report.summary) {
      return report.summary.substring(0, 50) + "...";
    }
    if (report.ats_analysis?.summary) {
      return report.ats_analysis.summary.substring(0, 50) + "...";
    }
    return "分析报告";
  };

  const getReportType = (report) => {
    if (report.gapAnalysis || report.opportunityHighlights) {
      return "简历分析";
    }
    if (report.ats_analysis || report.technical_analysis) {
      return "职位分析";
    }
    return "分析报告";
  };

  const getCreatedAt = (report) => {
    return new Date(report.createdAt || report.created_at).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center p-8">
        <div className="text-center">
          <FiLoader className="animate-spin text-indigo-600 h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            正在加载您的分析报告...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            历史分析报告
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            查看所有历史分析报告和AI建议
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-800 dark:text-red-300">
          <div className="flex">
            <FiAlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-5 mb-3">
                <FiFileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无分析报告
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
                开始分析您的简历和职位，获取专业的建议
              </p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="group relative p-4 sm:px-5 sm:py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg mr-3 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <span className={getModelColor(report.model)}>
                          {getModelIcon(report.model)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-start">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate mr-2">
                            {getReportTitle(report)}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {getReportTypeIcon(report)}
                            <span className="ml-1">
                              {(report.model || "未知").toUpperCase()}
                            </span>
                          </span>
                        </div>
                        <p className="text-xs text-left text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {getReportType(report)} · 创建于{" "}
                          {getCreatedAt(report)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center sm:space-x-3">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="查看报告"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(report._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="删除报告"
                        >
                          <FiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHistorySection;
