import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBriefcase,
  FiEdit,
  FiTrash,
  FiPlus,
  FiChevronRight,
  FiChevronDown,
  FiExternalLink,
  FiLoader,
  FiX,
  FiAlertCircle,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiArrowLeft,
  FiInfo,
  FiTrash2,
  FiBookmark,
  FiCheckCircle,
} from "react-icons/fi";
import JobConfirmation from "../components/JobConfirmation";
import AnalysisReportsList from "../components/AnalysisReportsList";

const JobManagerPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [viewingReportsJobId, setViewingReportsJobId] = useState(null);
  const [viewingReportsJobTitle, setViewingReportsJobTitle] = useState("");

  // 状态选项
  const statusOptions = [
    { value: "saved", label: "已保存", color: "bg-blue-100 text-blue-800" },
    {
      value: "applied",
      label: "已申请",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "interviewing",
      label: "面试中",
      color: "bg-amber-100 text-amber-800",
    },
    {
      value: "offered",
      label: "已收到offer",
      color: "bg-green-100 text-green-800",
    },
    { value: "rejected", label: "已拒绝", color: "bg-red-100 text-red-800" },
  ];

  // 获取用户保存的所有职位
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("未登录状态");
      }

      const response = await axios.get("/api/jobs/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs(response.data.data || []);
    } catch (err) {
      console.error("获取职位失败:", err);
      setError(
        "获取职位信息失败，请重试：" +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 切换展开/折叠职位详情
  const toggleJobExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // 开始编辑职位 - 使用JobConfirmation
  const startEditJob = (job) => {
    setEditingJob({ ...job });
    setShowConfirmation(true);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingJob(null);
    setShowConfirmation(false);
  };

  // 更新职位状态
  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const job = jobs.find((j) => j._id === jobId);

      if (!job) return;

      const response = await axios.put(
        `/api/jobs/${jobId}`,
        { ...job, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 更新本地数据
      setJobs(jobs.map((j) => (j._id === jobId ? response.data.data : j)));
    } catch (err) {
      console.error("更新职位状态失败:", err);
      setError("更新职位状态失败，请重试");
    }
  };

  // 删除职位
  const deleteJob = async (jobId) => {
    if (!window.confirm("确定要删除这个职位吗？")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setJobs(jobs.filter((job) => job._id !== jobId));
      } else {
        setError(response.data.message || "删除职位失败");
      }
    } catch (err) {
      console.error("删除职位错误:", err);
      setError("删除职位失败，请重试");
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 获取状态样式
  const getStatusStyle = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  // 添加新函数 - 查看报告
  const viewJobReports = (job) => {
    setViewingReportsJobId(job._id);
    setViewingReportsJobTitle(job.title);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (showConfirmation && editingJob) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <button
            onClick={cancelEdit}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <FiArrowLeft className="mr-2" /> 返回职位列表
          </button>
        </div>

        <JobConfirmation
          parsedJob={editingJob}
          setParsedJob={setEditingJob}
          onSuccess={(updatedJob) => {
            // 更新本地数据
            setJobs(
              jobs.map((j) => (j._id === updatedJob._id ? updatedJob : j))
            );
            setShowConfirmation(false);
            setEditingJob(null);
          }}
          onCancel={cancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          职位管理
        </h1>
        <button
          onClick={() => navigate("/jobs/new")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <FiPlus className="mr-2" /> 添加职位
        </button>
      </div>

      {showConfirmation && editingJob ? (
        <JobConfirmation
          parsedJob={editingJob}
          setParsedJob={setEditingJob}
          onSuccess={(updatedJob) => {
            // 更新本地数据
            setJobs(
              jobs.map((j) => (j._id === updatedJob._id ? updatedJob : j))
            );
            setShowConfirmation(false);
            setEditingJob(null);
          }}
          onCancel={cancelEdit}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-8 text-center">
              <FiInfo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无职位
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                您还没有添加任何职位，点击下方按钮添加第一个职位。
              </p>
              <button
                onClick={() => navigate("/jobs/new")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
              >
                <FiPlus className="mr-2" /> 添加职位
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <div
                    className="px-6 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleJobExpand(job._id)}
                  >
                    <div className="flex items-center">
                      <FiBriefcase className="text-indigo-500 dark:text-indigo-400 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {job.company} · {job.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {job.status === "saved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateJobStatus(job._id, "interviewed");
                          }}
                          className="text-yellow-500 hover:text-yellow-600 p-2"
                          title="标记为已面试"
                        >
                          <FiBookmark size={18} />
                        </button>
                      )}
                      {job.status === "interviewed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateJobStatus(job._id, "offered");
                          }}
                          className="text-green-500 hover:text-green-600 p-2"
                          title="标记为已录用"
                        >
                          <FiCheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditJob(job);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteJob(job._id);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewJobReports(job);
                        }}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-2"
                      >
                        <FiExternalLink size={18} />
                      </button>
                      {expandedJobId === job._id ? (
                        <FiChevronDown className="text-gray-400" />
                      ) : (
                        <FiChevronRight className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedJobId === job._id && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300">
                      <div className="space-y-5 text-left">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            技术栈
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.tech_stack && job.tech_stack.length > 0 ? (
                              job.tech_stack.map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800/40 text-blue-800 dark:text-blue-300"
                                >
                                  {tech}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">
                                未指定
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            职位要求
                          </h4>
                          {job.requirements && job.requirements.length > 0 ? (
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {job.requirements.map((req, idx) => (
                                <li key={idx} className="text-left">
                                  {req}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">未指定</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            优先资格
                          </h4>
                          {job.preferred_qualifications &&
                          job.preferred_qualifications.length > 0 ? (
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {job.preferred_qualifications.map((qual, idx) => (
                                <li key={idx} className="text-left">
                                  {qual}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">未指定</p>
                          )}
                        </div>

                        <div className="flex mt-4">
                          <button
                            onClick={() => viewJobReports(job)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            查看分析
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-800 dark:text-red-300 rounded-lg flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* 添加报告列表模态窗口 */}
      {viewingReportsJobId && (
        <AnalysisReportsList
          jobId={viewingReportsJobId}
          jobTitle={viewingReportsJobTitle}
          onClose={() => setViewingReportsJobId(null)}
        />
      )}
    </div>
  );
};

export default JobManagerPage;
