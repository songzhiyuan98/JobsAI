import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiLoader,
  FiX,
  FiArrowLeft,
  FiCheckCircle,
  FiCpu,
} from "react-icons/fi";
import AITypingAnimation from "../components/AITypingAnimation";

const JobSubmitterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("input"); // input, analyzing, editing, success
  const [jobText, setJobText] = useState("");
  const [parsedJob, setParsedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [, setAnalysisStage] = useState("");

  // 可以为AI分析阶段自定义提示消息
  const aiAnalysisMessages = [
    "初始化AI引擎...",
    "分析职位文本内容...",
    "识别职位名称与公司信息...",
    "提取核心职责与任职要求...",
    "分析技能要求与技术栈...",
    "提取福利待遇等补充信息...",
    "生成结构化职位数据...",
  ];

  // 解析职位描述
  const parseJob = async () => {
    if (!jobText.trim()) {
      setError("请输入职位描述");
      return;
    }

    setLoading(true);
    setError(null);
    setStep("analyzing");

    // 模拟AI分析进度
    simulateAnalysisProgress();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/jobs/parse",
        { jobText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // 完成进度条动画后再显示结果
        setTimeout(() => {
          setParsedJob(response.data.data);
          setStep("editing");
          setLoading(false);
        }, Math.max(0, 3000 - analysisProgress * 30)); // 确保至少展示3秒动画
      } else {
        setError(response.data.message || "解析失败，请重试");
        setStep("input");
        setLoading(false);
      }
    } catch (err) {
      console.error("解析职位描述失败:", err);
      setError(err.response?.data?.message || "解析失败，请重试");
      setStep("input");
      setLoading(false);
    }
  };

  // 模拟AI分析进度
  const simulateAnalysisProgress = () => {
    let progress = 0;
    const stages = [
      "预处理职位文本内容...",
      "识别职位名称与公司信息...",
      "提取核心职责与任职要求...",
      "分析技能要求与技术栈...",
      "提取福利待遇等补充信息...",
      "生成结构化职位数据...",
    ];

    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        return;
      }

      progress += Math.random() * 3 + 1;
      progress = Math.min(progress, 100);

      // 根据进度更新阶段
      const stageIndex = Math.min(
        Math.floor(progress / (100 / stages.length)),
        stages.length - 1
      );

      setAnalysisProgress(progress);
      setAnalysisStage(stages[stageIndex]);
    }, 180);
  };

  // 处理字段变更
  const handleFieldChange = (field, value) => {
    setParsedJob({ ...parsedJob, [field]: value });
  };

  // 处理数组类型字段变更（如requirements, tech_stack等）
  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...(parsedJob[field] || [])];

    if (value === "") {
      // 删除项目
      newArray.splice(index, 1);
    } else {
      // 更新项目
      newArray[index] = value;
    }

    setParsedJob({ ...parsedJob, [field]: newArray });
  };

  // 添加新项到数组字段
  const addArrayItem = (field, value = "") => {
    if (!value.trim()) return;
    const newArray = [...(parsedJob[field] || []), value.trim()];
    setParsedJob({ ...parsedJob, [field]: newArray });
  };

  // 保存职位描述
  const saveJob = async () => {
    if (!parsedJob.title || !parsedJob.company) {
      setError("职位名称和公司名称为必填项");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/jobs", parsedJob, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStep("success");
      } else {
        setError(response.data.message || "保存失败，请重试");
      }
    } catch (err) {
      console.error("保存职位失败:", err);
      setError(err.response?.data?.message || "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {/* 顶部导航栏 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-3"
            >
              <FiArrowLeft className="text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {step === "input" && "添加职位描述"}
              {step === "analyzing" && "AI智能分析中"}
              {step === "editing" && "编辑职位信息"}
              {step === "success" && "添加成功"}
            </h2>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {error && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {step === "input" && (
            <div>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                请粘贴职位描述文本，系统将自动分析并提取关键信息。您可以在下一步中进行修改和补充。
              </p>

              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="粘贴职位描述文本，如：前端开发工程师，要求精通React、Vue等..."
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 transition-colors"
              />

              <div className="flex justify-end mt-6">
                <button
                  onClick={parseJob}
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg shadow transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      处理中...
                    </>
                  ) : (
                    "开始分析"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <div className="py-8">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                  <FiCpu className="text-indigo-600 dark:text-indigo-400 text-4xl animate-pulse" />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  AI智能分析中
                </h3>

                <div className="w-full max-w-md bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className="h-2 bg-indigo-600 rounded-full"
                    style={{
                      width: `${analysisProgress}%`,
                      transition: "width 0.3s ease",
                    }}
                  ></div>
                </div>

                <div className="w-full max-w-md mb-6">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>解析中</span>
                    <span>{Math.round(analysisProgress)}%</span>
                  </div>
                </div>

                <div className="text-center mb-4 h-6">
                  <AITypingAnimation messages={aiAnalysisMessages} />
                </div>
              </div>
            </div>
          )}

          {step === "editing" && (
            <div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6">
                <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                  AI已分析完成，您可以检查并编辑以下信息。
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      职位名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={parsedJob?.title || ""}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      公司名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={parsedJob?.company || ""}
                      onChange={(e) =>
                        handleFieldChange("company", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      工作地点
                    </label>
                    <input
                      type="text"
                      value={parsedJob?.location || ""}
                      onChange={(e) =>
                        handleFieldChange("location", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      薪资范围
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="最低"
                        value={parsedJob?.salary_min || ""}
                        onChange={(e) =>
                          handleFieldChange("salary_min", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="text"
                        placeholder="最高"
                        value={parsedJob?.salary_max || ""}
                        onChange={(e) =>
                          handleFieldChange("salary_max", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    技术栈
                  </label>
                  <div className="space-y-2">
                    {parsedJob?.tech_stack &&
                      parsedJob.tech_stack.map((tech, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                              handleArrayFieldChange("tech_stack", index, "")
                            }
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="添加技术..."
                        className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            e.preventDefault();
                            addArrayItem("tech_stack", e.target.value);
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
                    {parsedJob?.requirements &&
                      parsedJob.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                              handleArrayFieldChange("requirements", index, "")
                            }
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="添加要求..."
                        className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            e.preventDefault();
                            addArrayItem("requirements", e.target.value);
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
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={() => setStep("input")}
                    className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    返回
                  </button>
                  <button
                    onClick={saveJob}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 disabled:from-indigo-400 disabled:to-blue-400 text-white rounded-lg shadow-md transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        保存中...
                      </>
                    ) : (
                      "保存职位"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                职位添加成功
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                职位已成功保存，您可以返回职位管理页面查看或继续添加新职位。
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setJobText("");
                    setParsedJob(null);
                    setStep("input");
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  添加另一个
                </button>
                <button
                  onClick={() => navigate("/job-manager")}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg shadow-md transition-colors"
                >
                  查看职位
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSubmitterPage;
