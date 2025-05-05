import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiX, FiAward, FiCheck, FiAlertCircle } from "react-icons/fi";

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
        const response = await axios.get(`/api/analysis?jobId=${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setReports(response.data.data);
        } else {
          setError(response.data.message || "获取分析报告失败");
        }
      } catch (err) {
        setError(
          "无法获取分析报告: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [jobId]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-700 text-2xl font-light z-10 rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="关闭"
        >
          <FiX />
        </button>
        {/* 标题栏 */}
        <div className="px-8 pt-8 pb-4">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
            分析报告
          </h3>
          <p className="text-sm text-gray-600">职位：{jobTitle}</p>
        </div>
        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {error && (
            <div className="flex items-center justify-center text-red-500 py-8 text-sm">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-base">
              加载分析报告...
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-base">
              暂无分析报告
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm divide-y divide-gray-200">
              {reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() =>
                    navigate(
                      `/analysis/${
                        report.model === "gpt4o" ? "gpt4o" : "gemini"
                      }/${report._id}`
                    )
                  }
                  className="group relative p-4 sm:px-5 sm:py-4 transition-colors hover:bg-gray-50 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* 左侧：简历名和时间 */}
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg mr-3 flex items-center justify-center bg-gray-100 text-gray-600">
                      <FiAward className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-start">
                        <h3 className="text-base font-medium text-gray-900 truncate mr-2">
                          {report.resume?.name || "未命名简历"}
                        </h3>
                      </div>
                      <p className="text-xs text-left text-gray-500 mt-0.5 truncate">
                        分析于{" "}
                        {formatDate(report.createdAt || report.created_at)}
                      </p>
                    </div>
                  </div>
                  {/* 右侧：分数、排名、HR推荐 */}
                  <div className="mt-3 sm:mt-0 flex items-center sm:space-x-6">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-900 rounded-lg">
                      ATS {report.ats_analysis?.match_score_percent || 0}%
                    </span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-900 rounded-lg">
                      排名{" "}
                      {100 -
                        (report.ranking_analysis?.predicted_rank_percentile ||
                          0)}
                      %
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg ${
                        report.hr_analysis?.recommend_interview
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {report.hr_analysis?.recommend_interview ? (
                        <>
                          <FiCheck className="mr-1 h-3 w-3" />
                          推荐
                        </>
                      ) : (
                        "不推荐"
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 底部统计 */}
        <div className="px-8 py-4 text-xs text-gray-500 text-center bg-white border-t border-gray-200">
          共找到 {reports.length} 个分析报告
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportsList;
