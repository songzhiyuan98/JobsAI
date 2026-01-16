import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBriefcase,
  FiEdit,
  FiPlus,
  FiChevronRight,
  FiChevronDown,
  FiLoader,
  FiAlertCircle,
  FiArrowLeft,
  FiInfo,
  FiTrash2,
  FiBookmark,
  FiCheckCircle,
  FiBarChart2,
} from "react-icons/fi";
import JobConfirmation from "../components/job/JobConfirmation";
import AnalysisReportsList from "../components/analysis/AnalysisReportsList";

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
      <div className="container mx-auto max-w-5xl">
        <div>
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
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            职位管理
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理您保存的职位信息
          </p>
        </div>
        <button
          onClick={() => navigate("/jobs/new")}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-sm flex items-center"
        >
          <FiPlus className="mr-2" /> 添加职位
        </button>
      </div>

      {showConfirmation && editingJob ? (
        <JobConfirmation
          parsedJob={editingJob}
          setParsedJob={setEditingJob}
          onSuccess={(updatedJob) => {
            setJobs(
              jobs.map((j) => (j._id === updatedJob._id ? updatedJob : j))
            );
            setShowConfirmation(false);
            setEditingJob(null);
          }}
          onCancel={cancelEdit}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-7 text-center">
              <FiInfo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无职位
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                您还没有添加任何职位，点击下方按钮添加第一个职位。
              </p>
              <button
                onClick={() => navigate("/jobs/new")}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-sm inline-flex items-center"
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
                    className="px-5 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleJobExpand(job._id)}
                  >
                    <div className="flex items-center">
                      <FiBriefcase className="text-gray-600 dark:text-gray-400 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2"
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
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2"
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
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteJob(job._id);
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewJobReports(job);
                        }}
                        className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center"
                      >
                        <FiBarChart2 className="mr-1" size={16} />
                        <span className="text-sm">分析报告</span>
                      </button>
                      {expandedJobId === job._id ? (
                        <FiChevronDown className="text-gray-400" size={18} />
                      ) : (
                        <FiChevronRight className="text-gray-400" size={18} />
                      )}
                    </div>
                  </div>

                  {expandedJobId === job._id && (
                    <div className="px-5 py-4 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300">
                      <div className="space-y-4 text-left">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            技术栈
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.tech_stack && job.tech_stack.length > 0 ? (
                              job.tech_stack.map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  {tech}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">
                                未指定
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
                            <p className="text-xs text-gray-500">未指定</p>
                          )}
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
        <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-800 dark:text-red-300 rounded-lg flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

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
