import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEdit,
  FiUser,
  FiInfo,
  FiLoader,
  FiCheck,
  FiFileText,
  FiActivity,
  FiBriefcase,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiTool,
  FiX,
  FiMessageSquare,
  FiAlertTriangle,
  FiUpload,
} from "react-icons/fi";
import ResumePreview from "../components/ResumePreview";

const AnalysisStartPage = () => {
  const navigate = useNavigate();

  // 步骤状态
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // JD相关状态
  const [jobInput, setJobInput] = useState("");
  const [isParsingJob, setIsParsingJob] = useState(false);
  const [parsedJob, setParsedJob] = useState(null);
  const [jobVerificationStep, setJobVerificationStep] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");

  // 职位和简历状态
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  // 简历预览状态
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [previewResumeId, setPreviewResumeId] = useState(null);

  // 获取用户保存的职位列表和简历
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // 获取用户保存的职位
        const jobsResponse = await axios.get("/api/jobs/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJobs(jobsResponse.data.data || []);

        // 获取用户的简历
        const resumesResponse = await axios.get("/api/resumes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resumesList = resumesResponse.data.data || [];
        setResumes(resumesList);

        // 默认选择激活的简历
        const activeResume = resumesList.find((resume) => resume.isActive);
        if (activeResume) {
          setSelectedResumeId(activeResume._id);
          setSelectedResume(activeResume);
        }

        setLoading(false);
      } catch (err) {
        console.error("获取数据失败:", err);
        setError("无法加载数据，请重试");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 从JobSubmit复制的模拟分析进度功能
  const simulateAnalysisProgress = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // 修复从JobSubmit复制的handleJobSubmit函数 - 使用正确的API参数名
  const handleJobSubmit = async () => {
    if (!jobInput.trim()) {
      setError("请输入职位描述");
      return;
    }

    setIsParsingJob(true);
    setError(null);

    // 模拟AI分析进度
    simulateAnalysisProgress();

    try {
      const token = localStorage.getItem("token");
      // 这里修改为jobText参数名，与后端API匹配
      const response = await axios.post(
        "/api/jobs/parse",
        { jobText: jobInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // 完成进度条动画后再显示结果
        setTimeout(() => {
          setParsedJob(response.data.data);
          setJobVerificationStep(true);
          setIsParsingJob(false);
        }, Math.max(0, 3000 - analysisProgress * 30)); // 确保至少展示3秒动画
      } else {
        setError(response.data.message || "解析失败，请重试");
        setIsParsingJob(false);
      }
    } catch (err) {
      setError("解析职位失败：" + (err.response?.data?.message || err.message));
      setIsParsingJob(false);
    }
  };

  // 修复confirmParsedJob函数 - 使用正确的响应字段名
  const confirmParsedJob = async () => {
    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");

      const response = await axios.post("/api/jobs", parsedJob, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // 使用data字段而不是job字段，与后端API匹配
        setSelectedJobId(response.data.data._id);
        setSelectedJob(response.data.data);
        setJobVerificationStep(false);
        setStep(2); // 进入选择简历步骤
      } else {
        setError(response.data.message || "保存职位失败，请重试");
      }
    } catch (err) {
      setError("保存职位失败：" + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAction(false);
    }
  };

  // 选择职位
  const handleSelectJob = (job) => {
    setSelectedJobId(job._id);
    setSelectedJob(job);
  };

  // 选择简历
  const handleSelectResume = (resume) => {
    setSelectedResumeId(resume._id);
    setSelectedResume(resume);
  };

  // 进入确认页面
  const goToConfirmation = () => {
    // 确保已经选择了职位和简历
    if (!selectedJobId || !selectedResumeId) {
      setError("请选择职位和简历");
      return;
    }
    setStep(3);
  };

  // 开始分析
  const startAnalysis = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setError("请选择职位和简历");
      return;
    }

    try {
      setLoadingAction(true);
      setError(null);
      const token = localStorage.getItem("token");

      // 调用后端的分析API
      const response = await axios.post(
        "/api/analysis",
        {
          jobId: selectedJobId,
          resumeId: selectedResumeId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigate(`/analysis/${response.data.data._id}`);
      } else {
        setError(response.data.message || "创建分析失败");
        setLoadingAction(false);
      }
    } catch (err) {
      setError("创建分析失败：" + (err.response?.data?.message || err.message));
      setLoadingAction(false);
    }
  };

  // 开始面试
  const startInterview = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setError("请选择职位和简历");
      return;
    }

    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/interviews",
        {
          jobId: selectedJobId,
          resumeId: selectedResumeId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigate(`/interview/${response.data.data._id}`);
      }
    } catch (err) {
      setError("创建面试失败：" + (err.response?.data?.message || err.message));
      setLoadingAction(false);
    }
  };

  // 跳转到简历上传页面
  const goToResumeUpload = () => {
    // 保存当前状态
    localStorage.setItem("returnToInterview", "true");
    localStorage.setItem("selectedJobId", selectedJobId);
    navigate("/resume/upload");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (showResumePreview) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ResumePreview
          resumeId={previewResumeId}
          onClose={() => setShowResumePreview(false)}
          onEdit={() => {
            setShowResumePreview(false);
            navigate("/resume/edit/" + previewResumeId);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* 页面标题和返回按钮 */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {step === 1
            ? jobVerificationStep
              ? "确认职位信息"
              : "选择面试职位"
            : step === 2
            ? "选择简历"
            : "确认分析信息"}
        </h1>
      </div>

      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <FiBriefcase
                className={step >= 1 ? "text-white" : "text-gray-500"}
              />
            </div>
            <div
              className={`ml-2 text-sm ${
                step >= 1
                  ? "text-gray-900 dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              选择职位
            </div>
          </div>

          <div
            className={`flex-1 h-1 mx-4 ${
              step >= 2 ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />

          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <FiFileText
                className={step >= 2 ? "text-white" : "text-gray-500"}
              />
            </div>
            <div
              className={`ml-2 text-sm ${
                step >= 2
                  ? "text-gray-900 dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              选择简历
            </div>
          </div>

          <div
            className={`flex-1 h-1 mx-4 ${
              step >= 3 ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />

          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <FiCheckCircle
                className={step >= 3 ? "text-white" : "text-gray-500"}
              />
            </div>
            <div
              className={`ml-2 text-sm ${
                step >= 3
                  ? "text-gray-900 dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              确认信息
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center">
          <FiAlertTriangle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
          <button
            className="ml-auto text-red-500 hover:text-red-700"
            onClick={() => setError(null)}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* 第一步：JD输入和解析 */}
      {step === 1 && !jobVerificationStep && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white text-left">
              添加职位描述
            </h2>

            <div className="space-y-6">
              {/* JD 输入区域 */}
              <div>
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  职位描述 (JD)
                </label>
                <textarea
                  id="jobDescription"
                  rows="10"
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  placeholder="粘贴职位描述、JD或要求..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  复制粘贴完整的职位描述，以获得最准确的面试体验
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
            >
              <FiArrowLeft className="mr-2" /> 返回
            </button>

            <button
              onClick={handleJobSubmit}
              disabled={isParsingJob || !jobInput.trim()}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center ${
                isParsingJob || !jobInput.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isParsingJob ? (
                <>
                  <div className="flex items-center">
                    <FiLoader className="animate-spin mr-2" />
                    <span className="mr-2">分析中</span>
                    <span>{analysisProgress}%</span>
                  </div>
                </>
              ) : (
                <>
                  解析职位 <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* JD解析确认 */}
      {step === 1 && jobVerificationStep && parsedJob && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white text-left">
              确认职位信息
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                <div className="flex items-start">
                  <FiInfo className="text-indigo-600 dark:text-indigo-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    我们已分析您提供的职位描述，并提取了以下信息。请检查并确认，或根据需要进行编辑。
                  </p>
                </div>
              </div>

              {/* 职位标题 */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  职位标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={parsedJob.title || ""}
                  onChange={(e) =>
                    setParsedJob({ ...parsedJob, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* 公司名称 */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  公司名称
                </label>
                <input
                  type="text"
                  id="company"
                  value={parsedJob.company || ""}
                  onChange={(e) =>
                    setParsedJob({ ...parsedJob, company: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* 技术栈 */}
              {parsedJob.tech_stack && parsedJob.tech_stack.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    技术栈
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {parsedJob.tech_stack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm flex items-center"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedTechStack = [...parsedJob.tech_stack];
                            updatedTechStack.splice(index, 1);
                            setParsedJob({
                              ...parsedJob,
                              tech_stack: updatedTechStack,
                            });
                          }}
                          className="ml-1.5 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 职位要求 */}
              {parsedJob.requirements && parsedJob.requirements.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    职位要求
                  </label>
                  <div className="space-y-2">
                    {parsedJob.requirements.map((req, index) => (
                      <div key={index} className="flex items-start">
                        <textarea
                          value={req}
                          onChange={(e) => {
                            const updatedRequirements = [
                              ...parsedJob.requirements,
                            ];
                            updatedRequirements[index] = e.target.value;
                            setParsedJob({
                              ...parsedJob,
                              requirements: updatedRequirements,
                            });
                          }}
                          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedRequirements = [
                              ...parsedJob.requirements,
                            ];
                            updatedRequirements.splice(index, 1);
                            setParsedJob({
                              ...parsedJob,
                              requirements: updatedRequirements,
                            });
                          }}
                          className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 原始JD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  原始职位描述
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {parsedJob.description || jobInput}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setJobVerificationStep(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
            >
              <FiArrowLeft className="mr-2" /> 返回
            </button>

            <button
              onClick={confirmParsedJob}
              disabled={loadingAction}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center ${
                loadingAction ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loadingAction ? (
                <>
                  <FiLoader className="animate-spin mr-2" /> 处理中
                </>
              ) : (
                <>
                  确认并继续 <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 第二步：选择简历 */}
      {step === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white text-left">
              选择要使用的简历
            </h2>

            {resumes.length > 0 ? (
              <div className="space-y-3 mb-6">
                {resumes.map((resume) => (
                  <div
                    key={resume._id}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedResumeId === resume._id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                    }`}
                    onClick={() => handleSelectResume(resume)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div
                          className={`mt-1 flex items-center justify-center h-5 w-5 rounded-full border ${
                            selectedResumeId === resume._id
                              ? "bg-indigo-500 border-indigo-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedResumeId === resume._id && (
                            <FiCheck className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {resume.basicInfo?.fullName || "未命名简历"}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {resume.basicInfo?.title && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                {resume.basicInfo.title}
                              </span>
                            )}
                            {resume.isActive && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                当前简历
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowResumePreview(true);
                          setPreviewResumeId(resume._id);
                        }}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                      >
                        预览
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-6">
                <FiFileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  您还没有上传任何简历
                </p>
                <button
                  onClick={goToResumeUpload}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center"
                >
                  <FiUpload className="mr-2" /> 上传简历
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
            >
              <FiArrowLeft className="mr-2" /> 返回
            </button>

            {resumes.length > 0 ? (
              <button
                onClick={goToConfirmation}
                disabled={loadingAction || !selectedResumeId}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center ${
                  loadingAction || !selectedResumeId
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loadingAction ? (
                  <>
                    <FiLoader className="animate-spin mr-2" /> 处理中
                  </>
                ) : (
                  <>
                    下一步 <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToResumeUpload}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
              >
                <FiUpload className="mr-2" /> 上传简历
              </button>
            )}
          </div>
        </div>
      )}

      {/* 第三步：确认信息 - 左右布局的JD和简历预览 */}
      {step === 3 && selectedJob && selectedResume && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-medium mb-6 text-gray-900 dark:text-white text-left">
            确认匹配分析信息
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧：职位信息 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <FiBriefcase className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-medium text-indigo-800 dark:text-indigo-300">
                    职位信息
                  </h3>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {selectedJobId?.substring(0, 8)}
                </div>
              </div>

              <div className="p-4 max-h-[450px] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedJob.title || "职位标题"}
                    </h4>
                    {selectedJob.company && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedJob.company}
                      </p>
                    )}
                  </div>

                  {selectedJob.requirements && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        职位要求
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob.responsibilities && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        工作职责
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {selectedJob.responsibilities.map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        技能要求
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        福利待遇
                      </h5>
                      <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {selectedJob.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：简历信息 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <FiFileText className="mr-2 text-green-600 dark:text-green-400" />
                  <h3 className="font-medium text-green-800 dark:text-green-300">
                    简历信息
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setPreviewResumeId(selectedResumeId);
                    setShowResumePreview(true);
                  }}
                  className="text-xs flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <FiEye className="mr-1" /> 查看完整简历
                </button>
              </div>

              <div className="p-4 max-h-[450px] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedResume.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-3">
                      {selectedResume.title && (
                        <span>{selectedResume.title}</span>
                      )}
                      {selectedResume.email && (
                        <span className="truncate max-w-[200px]">
                          {selectedResume.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedResume.education &&
                    selectedResume.education.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          教育背景
                        </h5>
                        <div className="space-y-2">
                          {selectedResume.education.map((edu, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium text-gray-800 dark:text-gray-200">
                                {edu.degree} - {edu.major}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">
                                {edu.institution}
                                {edu.date && (
                                  <span className="ml-2 text-xs">
                                    ({edu.date})
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedResume.experience &&
                    selectedResume.experience.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          工作经验
                        </h5>
                        <div className="space-y-3">
                          {selectedResume.experience
                            .slice(0, 3)
                            .map((exp, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                  {exp.title} - {exp.company}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {exp.date}
                                </div>
                                {exp.description && (
                                  <div className="mt-1 text-gray-700 dark:text-gray-300 text-xs line-clamp-2">
                                    {exp.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          {selectedResume.experience.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              还有 {selectedResume.experience.length - 3}{" "}
                              项工作经验
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {selectedResume.skills &&
                    selectedResume.skills.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          技能
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedResume.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" /> 返回
            </button>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startInterview}
                disabled={loadingAction}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center ${
                  loadingAction ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loadingAction ? (
                  <>
                    <FiLoader className="animate-spin mr-2" /> 处理中
                  </>
                ) : (
                  <>
                    <FiMessageSquare className="mr-2" /> 模拟面试
                  </>
                )}
              </button>

              <button
                onClick={startAnalysis}
                disabled={loadingAction}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center ${
                  loadingAction ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loadingAction ? (
                  <>
                    <FiLoader className="animate-spin mr-2" /> 处理中
                  </>
                ) : (
                  <>
                    <FiActivity className="mr-2" /> 生成分析报告
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisStartPage;
