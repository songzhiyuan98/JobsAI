import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiLoader,
  FiAlertCircle,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiTag,
  FiInfo,
} from "react-icons/fi";

const JobPreview = ({ jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setJob(response.data.data);
        } else {
          setError(response.data.message || "获取职位信息失败");
        }
      } catch (err) {
        setError(
          "获取职位信息失败: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // 处理点击背景关闭
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "未知";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FiBriefcase className="text-indigo-500 mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              职位详情
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FiLoader className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                加载职位信息...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiAlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <p className="text-red-500 font-medium mb-2">加载失败</p>
              <p className="text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          ) : job ? (
            <div className="space-y-6">
              {/* 职位标题 */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-3">
                  {job.company && (
                    <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FiBriefcase className="mr-1" />
                      {job.company}
                    </div>
                  )}
                  {job.location && (
                    <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FiMapPin className="mr-1" />
                      {job.location}
                    </div>
                  )}
                  {job.salary && (
                    <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FiDollarSign className="mr-1" />
                      {job.salary}
                    </div>
                  )}
                  {job.createdAt && (
                    <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FiCalendar className="mr-1" />
                      发布于 {formatDate(job.createdAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* 职位描述 */}
              {job.description && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiFileText className="mr-2 text-indigo-500" />
                    职位描述
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {job.description}
                  </div>
                </div>
              )}

              {/* 必备技能 */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiTag className="mr-2 text-indigo-500" />
                    必备技能
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 加分技能 */}
              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiTag className="mr-2 text-green-500" />
                    加分技能
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 职责与要求 */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiInfo className="mr-2 text-indigo-500" />
                    工作职责
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    {job.responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiInfo className="mr-2 text-indigo-500" />
                    任职要求
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    {job.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiAlertCircle className="h-10 w-10 text-amber-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">未找到职位信息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPreview;
