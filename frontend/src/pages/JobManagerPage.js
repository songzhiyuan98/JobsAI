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
} from "react-icons/fi";

const JobManagerPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  // 开始编辑职位
  const startEditJob = (job) => {
    setEditingJob({ ...job });
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingJob(null);
  };

  // 处理编辑表单字段变更
  const handleFieldChange = (field, value) => {
    setEditingJob({ ...editingJob, [field]: value });
  };

  // 处理数组类型字段变更（如requirements, tech_stack等）
  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...editingJob[field]];

    if (value === "") {
      // 删除项目
      newArray.splice(index, 1);
    } else {
      // 更新项目
      newArray[index] = value;
    }

    setEditingJob({ ...editingJob, [field]: newArray });
  };

  // 添加新项到数组字段
  const addArrayItem = (field, value = "") => {
    if (!value.trim()) return;
    const newArray = [...(editingJob[field] || []), value.trim()];
    setEditingJob({ ...editingJob, [field]: newArray });
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

  // 保存编辑的职位
  const saveEditedJob = async () => {
    if (!editingJob) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/jobs/${editingJob._id}`,
        editingJob,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setJobs(
          jobs.map((job) =>
            job._id === editingJob._id ? response.data.data : job
          )
        );
        setEditingJob(null);
        setExpandedJobId(editingJob._id);
      } else {
        setError(response.data.message || "更新失败，请重试");
      }
    } catch (err) {
      console.error("保存职位失败:", err);
      setError("保存职位失败，请重试");
    }
  };

  // 删除职位
  const deleteJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setJobs(jobs.filter((job) => job._id !== jobId));
        setConfirmDelete(null);
      } else {
        setError(response.data.message || "删除失败，请重试");
      }
    } catch (err) {
      console.error("删除职位失败:", err);
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

  return (
    <div className="w-full px-4 py-8">
      {/* 内容容器居中但内部文本左对齐 */}
      <div className="max-w-5xl mx-auto">
        {/* 返回和页面标题 */}
        <div className="flex items-center mb-6 text-left">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-3 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-left">
              职位管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-left">
              管理您收藏的职位信息及申请状态
            </p>
          </div>
          <button
            onClick={() => navigate("/job-submit")}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" />
            添加职位
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 flex items-start text-left">
            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 职位列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FiLoader className="animate-spin text-indigo-600 text-4xl" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <div className="text-left w-full">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center rounded-full mb-4">
                  <FiBriefcase className="text-indigo-500 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  还没有添加职位
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  添加您感兴趣的职位信息，追踪申请进展
                </p>
                <button
                  onClick={() => navigate("/job-submit")}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="mr-2" />
                  添加第一个职位
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  {/* 职位信息头部 */}
                  <div
                    className={`px-5 py-4 cursor-pointer ${
                      expandedJobId === job._id || editingJob?._id === job._id
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}
                    onClick={() =>
                      !editingJob || editingJob._id !== job._id
                        ? toggleJobExpand(job._id)
                        : null
                    }
                  >
                    <div className="flex items-start justify-between text-left">
                      <div className="flex-1">
                        <div className="flex items-start">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-2">
                            {job.title}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                              job.status
                            )}`}
                          >
                            {statusOptions.find(
                              (opt) => opt.value === job.status
                            )?.label || "未知"}
                          </span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 text-left mt-1">
                          {job.company}
                        </div>
                        <div className="flex items-center flex-wrap text-sm text-gray-500 dark:text-gray-400 mt-2 gap-3">
                          {job.location && (
                            <div className="flex items-center">
                              <FiMapPin className="mr-1" />
                              {job.location}
                            </div>
                          )}
                          {job.salary_range && (
                            <div className="flex items-center">
                              <FiDollarSign className="mr-1" />
                              {job.salary_range}
                            </div>
                          )}
                          <div className="flex items-center">
                            <FiCalendar className="mr-1" />
                            {formatDate(job.updatedAt)}
                          </div>
                        </div>

                        {/* 技术栈标签 */}
                        {job.tech_stack && job.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.tech_stack.slice(0, 5).map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              >
                                {tech}
                              </span>
                            ))}
                            {job.tech_stack.length > 5 && (
                              <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                +{job.tech_stack.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center">
                        {expandedJobId === job._id ? (
                          <FiChevronDown className="text-gray-500 dark:text-gray-400 ml-2 text-xl" />
                        ) : (
                          <FiChevronRight className="text-gray-500 dark:text-gray-400 ml-2 text-xl" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 展开的详情区域 */}
                  {expandedJobId === job._id && (
                    <div className="px-5 py-4">
                      {editingJob && editingJob._id === job._id ? (
                        <div className="space-y-4 text-left">
                          {/* 编辑表单 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                职位名称
                              </label>
                              <input
                                type="text"
                                value={editingJob.title || ""}
                                onChange={(e) =>
                                  handleFieldChange("title", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                公司名称
                              </label>
                              <input
                                type="text"
                                value={editingJob.company || ""}
                                onChange={(e) =>
                                  handleFieldChange("company", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                工作地点
                              </label>
                              <input
                                type="text"
                                value={editingJob.location || ""}
                                onChange={(e) =>
                                  handleFieldChange("location", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                薪资范围
                              </label>
                              <input
                                type="text"
                                value={editingJob.salary_range || ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    "salary_range",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              职位描述
                            </label>
                            <textarea
                              value={editingJob.description || ""}
                              onChange={(e) =>
                                handleFieldChange("description", e.target.value)
                              }
                              rows={4}
                              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              技术栈
                            </label>
                            <div className="space-y-2">
                              {(editingJob.tech_stack || []).map(
                                (tech, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="text"
                                      className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                                      value={tech}
                                      onChange={(e) =>
                                        handleArrayFieldChange(
                                          "tech_stack",
                                          index,
                                          e.target.value
                                        )
                                      }
                                    />
                                    <button
                                      onClick={() =>
                                        handleArrayFieldChange(
                                          "tech_stack",
                                          index,
                                          ""
                                        )
                                      }
                                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                    >
                                      <FiX />
                                    </button>
                                  </div>
                                )
                              )}
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder="添加技术..."
                                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.target.value.trim()
                                    ) {
                                      e.preventDefault();
                                      addArrayItem(
                                        "tech_stack",
                                        e.target.value
                                      );
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    const input = e.target.previousSibling;
                                    if (input.value.trim()) {
                                      addArrayItem("tech_stack", input.value);
                                      input.value = "";
                                    }
                                  }}
                                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md"
                                >
                                  添加
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              岗位要求
                            </label>
                            <div className="space-y-2">
                              {(editingJob.requirements || []).map(
                                (req, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="text"
                                      className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                                      value={req}
                                      onChange={(e) =>
                                        handleArrayFieldChange(
                                          "requirements",
                                          index,
                                          e.target.value
                                        )
                                      }
                                    />
                                    <button
                                      onClick={() =>
                                        handleArrayFieldChange(
                                          "requirements",
                                          index,
                                          ""
                                        )
                                      }
                                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                    >
                                      <FiX />
                                    </button>
                                  </div>
                                )
                              )}
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder="添加要求..."
                                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.target.value.trim()
                                    ) {
                                      e.preventDefault();
                                      addArrayItem(
                                        "requirements",
                                        e.target.value
                                      );
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    const input = e.target.previousSibling;
                                    if (input.value.trim()) {
                                      addArrayItem("requirements", input.value);
                                      input.value = "";
                                    }
                                  }}
                                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md"
                                >
                                  添加
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 pt-3">
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                            >
                              取消
                            </button>
                            <button
                              onClick={saveEditedJob}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 text-left">
                          {/* 查看模式 */}
                          <div className="flex justify-between">
                            <div className="flex space-x-1 mb-2">
                              <span
                                onClick={() => startEditJob(job)}
                                className="flex items-center px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-md cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                              >
                                <FiEdit className="mr-1" />
                                编辑
                              </span>
                              <span
                                onClick={() => setConfirmDelete(job._id)}
                                className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40"
                              >
                                <FiTrash className="mr-1" />
                                删除
                              </span>
                              {job.url && (
                                <a
                                  href={job.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-650"
                                >
                                  <FiExternalLink className="mr-1" />
                                  原始链接
                                </a>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    updateJobStatus(job._id, option.value)
                                  }
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    job.status === option.value
                                      ? `${option.color} font-medium`
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-650"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 职位详细信息 */}
                          <div className="mt-4">
                            {job.description && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                                  职位描述
                                </h4>
                                <div className="p-3 bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap text-left">
                                  {job.description}
                                </div>
                              </div>
                            )}

                            {job.requirements &&
                              job.requirements.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                                    岗位要求
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm text-left">
                                    {job.requirements.map((req, index) => (
                                      <li key={index}>{req}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {job.tech_stack && job.tech_stack.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                                  技术栈
                                </h4>
                                <div className="flex flex-wrap gap-1.5 text-left">
                                  {job.tech_stack.map((tech, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 删除确认对话框 */}
                  {confirmDelete === job._id && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-center justify-between text-left">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          确定要删除这个职位吗？此操作不可恢复。
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => deleteJob(job._id)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            确认删除
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
      </div>
    </div>
  );
};

export default JobManagerPage;
