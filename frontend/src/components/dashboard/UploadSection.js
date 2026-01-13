import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  Sparkles,
  Upload,
  FileText,
  History,
  Clock,
  Check,
  Search,
  X,
} from "lucide-react";
import { FiLoader } from "react-icons/fi";
import LoadingMaskAI from "./LoadingMaskAI";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { checkFeaturePermission } from "../../store/userActions";

// ============================================================
// 临时禁用订阅限制 - 测试运营版
// 要恢复订阅限制，将此值改为 false
// ============================================================
const DISABLE_SUBSCRIPTION_CHECK = true;

// 简历选择对话框组件
const ResumeSelectDialog = ({ onSelect, resumeList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  const filteredResumes = resumeList.filter((resume) =>
    (resume.name || resume.title || resume._id)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    const selected = resumeList.find(
      (resume) => resume._id === selectedResumeId
    );
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">选择简历</h3>
          <button
            onClick={() => onSelect(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索简历..."
            className="w-full pl-9 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredResumes.length > 0 ? (
            <div className="space-y-2">
              {filteredResumes.map((resume) => (
                <div
                  key={resume._id}
                  className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                    selectedResumeId === resume._id
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedResumeId(resume._id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      selectedResumeId === resume._id
                        ? "border-black bg-black text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedResumeId === resume._id && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-sm">
                        {resume.name || resume.title || resume._id}
                      </span>
                    </div>
                    {resume.updatedAt && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          更新于{" "}
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FileText className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500">没有找到匹配的简历</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            onClick={() => onSelect(null)}
          >
            取消
          </button>
          <button
            className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            onClick={handleSelect}
            disabled={!selectedResumeId}
          >
            选择
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UploadSection() {
  const [activeTab, setActiveTab] = useState("coverletter");
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [jdData, setJdData] = useState(null);
  const [analysisLines, setAnalysisLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const navigate = useNavigate();
  const { subscriptionStatus } = useSelector((state) => state.user);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [resumeList, setResumeList] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeSource, setResumeSource] = useState("upload");
  const [remainingUsage, setRemainingUsage] = useState({
    analysis: 1,
    coverLetter: 1,
  });

  // 处理标签切换
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 重置所有状态
    setResume(null);
    setJd("");
    setError("");
    setStep(0);
    setResumeData(null);
    setJdData(null);
    setAnalysisLines([]);
    setCurrentLine(0);
    setSelectedResume(null);
    setUploadedResume(null);
    setResumeSource("upload");
    // 根据会员状态设置默认模型
    if (
      subscriptionStatus === "premium" ||
      subscriptionStatus === "enterprise"
    ) {
      setSelectedModel("gpt-4o");
    } else {
      setSelectedModel("gemini-2.0-flash");
    }
  };

  // 根据会员状态设置默认模型
  useEffect(() => {
    if (
      subscriptionStatus === "premium" ||
      subscriptionStatus === "enterprise"
    ) {
      setSelectedModel("gpt-4o");
    } else {
      setSelectedModel("gemini-2.0-flash");
    }
  }, [subscriptionStatus]);

  useEffect(() => {
    if (step === 3 && loading && resumeData && jdData) {
      const lines = [
        `正在分析：姓名 ${resumeData.basicInfo?.fullName || "-"}`,
        `正在分析：邮箱 ${resumeData.basicInfo?.email || "-"}`,
        ...(resumeData.experience || []).map(
          (exp) => `工作经历：${exp.company || "-"} - ${exp.position || "-"}`
        ),
        ...(resumeData.skills || []).map(
          (skill) =>
            `技能：${skill.category || ""} - ${(skill.items || []).join(", ")}`
        ),
        `JD职位：${jdData.title || "-"}`,
        `JD公司：${jdData.company || "-"}`,
        ...(jdData.requirements || []).map((req) => `JD要求：${req}`),
      ];
      setAnalysisLines(lines);
      setCurrentLine(0);
      const interval = setInterval(() => {
        setCurrentLine((i) => {
          if (i < lines.length - 1) return i + 1;
          clearInterval(interval);
          return i;
        });
      }, 1300);
      return () => clearInterval(interval);
    }
  }, [step, loading, resumeData, jdData]);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/resumes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResumeList(res.data.data || []);
      } catch (err) {
        // 可选：错误处理
      }
    };
    fetchResumes();
  }, []);

  useEffect(() => {
    const fetchRemainingUsage = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/subscription/usage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRemainingUsage(response.data.remainingUsage);
      } catch (error) {
        console.error("获取剩余使用次数失败:", error);
      }
    };

    if (isAuthenticated) {
      fetchRemainingUsage();
    }
  }, [isAuthenticated]);

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setUploadedResume(null);
    setResume(resume);
    setShowResumeDialog(false);
  };

  const handleUploadResume = (file) => {
    setUploadedResume(file);
    setSelectedResume(null);
    setResume(file);
  };

  const handleRemoveResume = () => {
    setSelectedResume(null);
    setUploadedResume(null);
    setResume(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[前端] 开始提交分析请求");
    setError("");
    if ((!uploadedResume && !selectedResume) || !jd) {
      setError("请上传简历或选择已有简历，并填写JD");
      return;
    }
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // 检查权限
    try {
      console.log("[前端] 检查权限...");
      const hasPermission = await dispatch(
        checkFeaturePermission("gpt4oResumeAnalysis")
      ).unwrap();
      console.log("[前端] 权限检查结果:", hasPermission);
      if (!hasPermission) {
        setError("您今日的使用次数已用完，请升级会员或明天再试");
        return;
      }
    } catch (err) {
      console.error("[前端] 权限检查失败:", err);
      setError("权限检查失败：" + (err.message || "未知错误"));
      return;
    }

    setLoading(true);
    try {
      let resumeObj;

      if (selectedResume) {
        console.log("[前端] 使用已有简历:", selectedResume._id);
        resumeObj = selectedResume;
        setStep(2);
        setResumeData(resumeObj);
      } else if (uploadedResume) {
        console.log("[前端] 上传新简历...");
        setStep(1);
        const formData = new FormData();
        formData.append("resume", uploadedResume);
        const token = localStorage.getItem("token");
        const resumeRes = await axios.post("/api/resumes/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        resumeObj = resumeRes.data.data;
        console.log("[前端] 简历上传完成:", resumeObj._id);
        setResumeData(resumeObj);
      } else {
        setError("请上传简历或选择已有简历");
        setLoading(false);
        return;
      }

      console.log("[前端] 解析JD...");
      const token = localStorage.getItem("token");
      const jdParseRes = await axios.post(
        "/api/jobs/parse",
        { jobText: jd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const jdParsed = jdParseRes.data.data;
      console.log("[前端] JD解析完成");

      const jdSaveRes = await axios.post("/api/jobs", jdParsed, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jdObj = jdSaveRes.data.data;
      console.log("[前端] JD保存完成:", jdObj._id);
      setJdData(jdObj);

      setStep(3);
      console.log("[前端] 开始分析...");
      console.log("使用模型:", selectedModel);
      const analysisRes = await axios.post(
        "/api/analysis",
        {
          jobId: jdObj._id,
          resumeId: resumeObj._id,
          model: selectedModel,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateRemainingUsage(analysisRes);
      const analysisId = analysisRes.data.data._id;
      const modelType = analysisRes.data.model || "gemini";
      console.log("[前端] 分析完成，ID:", analysisId);
      if (modelType === "gpt4o") {
        navigate(`/analysis/gpt4o/${analysisId}`);
      } else {
        navigate(`/analysis/gemini/${analysisId}`);
      }
    } catch (err) {
      console.error("[前端] 分析失败:", err);
      setError("分析失败：" + (err.response?.data?.message || err.message));
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!resume && !selectedResume) {
      setError("请上传简历或选择已有简历");
      return;
    }
    if (!jd) {
      setError("请填写职位描述");
      return;
    }
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // 检查权限
    try {
      const hasPermission = await dispatch(
        checkFeaturePermission("coverLetter")
      ).unwrap();
      if (!hasPermission) {
        setError("您今日的使用次数已用完，请升级会员或明天再试");
        return;
      }
    } catch (err) {
      setError("权限检查失败：" + (err.message || "未知错误"));
      return;
    }

    setLoading(true);
    try {
      let resumeObj;

      if (selectedResume) {
        // 如果是已选择的简历，直接使用，跳过简历解析步骤
        resumeObj = selectedResume;
        setStep(2); // 直接从第2步开始
        console.log("[前端] 使用已有简历:", resumeObj._id);
      } else if (resume) {
        // 如果是新上传的简历，需要解析
        setStep(1);
        console.log("[前端] 上传新简历...");
        const formData = new FormData();
        formData.append("resume", resume);
        const token = localStorage.getItem("token");
        const resumeRes = await axios.post("/api/resumes/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        resumeObj = resumeRes.data.data;
        console.log("[前端] 简历上传并解析完成:", resumeObj._id);
      } else {
        setError("请上传简历或选择已有简历");
        setLoading(false);
        return;
      }

      console.log("[前端] 解析JD...");
      const token = localStorage.getItem("token");
      const jdParseRes = await axios.post(
        "/api/jobs/parse",
        { jobText: jd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const jdParsed = jdParseRes.data.data;
      const jdSaveRes = await axios.post("/api/jobs", jdParsed, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jdObj = jdSaveRes.data.data;
      console.log("[前端] JD解析并保存完成:", jdObj._id);

      setStep(3);
      console.log("[前端] 生成求职信...");
      console.log("selectedModel", selectedModel);
      const clRes = await axios.post(
        "/api/cover-letters",
        {
          jobId: jdObj._id,
          resumeId: resumeObj._id,
          model: selectedModel,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateRemainingUsage(clRes);
      const coverLetterId = clRes.data.data._id;
      console.log("[前端] 求职信生成完成，ID:", coverLetterId);
      navigate(`/cover-letter/${coverLetterId}`);
    } catch (err) {
      console.error("[前端] 求职信生成失败:", err);
      setError("生成失败：" + (err.response?.data?.message || err.message));
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  // 检查模型是否可用
  const isModelAvailable = (model) => {
    // 测试运营版：所有模型对所有用户开放
    if (DISABLE_SUBSCRIPTION_CHECK) return true;

    if (model === "gemini-2.0-flash") return true;
    if (model === "gpt-o1") return subscriptionStatus === "enterprise";
    if (model === "gpt-4o") {
      if (
        subscriptionStatus === "premium" ||
        subscriptionStatus === "enterprise"
      )
        return true;
      // 免费用户检查剩余使用次数
      return activeTab === "analysis"
        ? remainingUsage.analysis > 0
        : remainingUsage.coverLetter > 0;
    }
    return false;
  };

  // 获取模型提示信息
  const getModelTooltip = (model) => {
    // 测试运营版：显示免费开放提示
    if (DISABLE_SUBSCRIPTION_CHECK) {
      if (model === "gpt-4o" || model === "gpt-o1") {
        return "测试运营版：免费开放使用";
      }
      return "";
    }

    if (model === "gpt-4o") {
      if (
        subscriptionStatus === "premium" ||
        subscriptionStatus === "enterprise"
      ) {
        return "高级分析，无使用限制";
      }
      return `今日剩余使用次数：${
        activeTab === "analysis"
          ? remainingUsage.analysis
          : remainingUsage.coverLetter
      } 次`;
    }
    if (model === "gpt-o1") {
      return "需要企业版才能使用";
    }
    return "";
  };

  // 在每次请求后更新剩余使用次数
  const updateRemainingUsage = (response) => {
    const remainingUsageHeader = response.headers["x-remaining-usage"];
    if (remainingUsageHeader) {
      try {
        const usage = JSON.parse(remainingUsageHeader);
        setRemainingUsage(usage);
      } catch (error) {
        console.error("解析剩余使用次数失败:", error);
      }
    }
  };

  return (
    <section id="start" className="w-full py-20 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Get Started with TalentSync
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume and job description, choose the right AI model,
            and let TalentSync provide professional analysis and recommendations
          </p>
        </div>

        {/* Feature Selection */}
        <div className="w-full mb-8">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
            {/* Animated background */}
            <div
              className={`absolute h-full bg-black transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                activeTab === "coverletter" ? "left-0" : "left-1/2"
              } w-1/2`}
            />

            <button
              className={`px-6 py-3 text-center w-1/2 relative transition-colors duration-200 ${
                activeTab === "coverletter"
                  ? "text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => handleTabChange("coverletter")}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Cover Letter</span>
              </div>
            </button>
            <button
              className={`px-6 py-3 text-center w-1/2 relative transition-colors duration-200 ${
                activeTab === "analysis"
                  ? "text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => handleTabChange("analysis")}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Resume Analysis</span>
              </div>
            </button>
          </div>
        </div>

        {/* AI Model Selector */}
        <div className="mb-10 overflow-hidden relative rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50"></div>
          <div className="absolute inset-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="rgba(0,0,0,0.05)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="p-6 relative z-10">
            <div className="flex items-center mb-4">
              <Cpu className="h-5 w-5 mr-2 text-black" />
              <h3 className="text-xl font-semibold">Select AI Model</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Gemini 2.0 */}
              <div
                className={`flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer relative overflow-hidden group transition-all duration-300 ${
                  selectedModel === "gemini-2.0-flash"
                    ? "border-black shadow-md scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
                onClick={() => setSelectedModel("gemini-2.0-flash")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <input
                  type="radio"
                  id="gemini"
                  name="model"
                  value="gemini-2.0-flash"
                  checked={selectedModel === "gemini-2.0-flash"}
                  onChange={() => setSelectedModel("gemini-2.0-flash")}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="gemini"
                  className="flex flex-col cursor-pointer flex-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Gemini 2.0 Flash</span>
                    <span className="text-[11px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                      Free
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    Basic version, unlimited usage
                  </span>
                </label>
                <Sparkles className="h-4 w-4 text-gray-400 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* GPT-4o */}
              <div
                className={`flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer relative overflow-hidden group transition-all duration-300 ${
                  selectedModel === "gpt-4o"
                    ? "border-black shadow-md scale-[1.02]"
                    : "hover:scale-[1.01]"
                } ${
                  !isModelAvailable("gpt-4o")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  isModelAvailable("gpt-4o") && setSelectedModel("gpt-4o")
                }
                data-tooltip-id="gpt-4o-tooltip"
                data-tooltip-content={getModelTooltip("gpt-4o")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <input
                  type="radio"
                  id="gpt-4o"
                  name="model"
                  value="gpt-4o"
                  checked={selectedModel === "gpt-4o"}
                  onChange={() => setSelectedModel("gpt-4o")}
                  className="h-4 w-4"
                  disabled={!isModelAvailable("gpt-4o")}
                />
                <label
                  htmlFor="gpt-4o"
                  className="flex flex-col cursor-pointer flex-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">GPT-4o</span>
                    <span className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                      {subscriptionStatus === "premium" ||
                      subscriptionStatus === "enterprise"
                        ? "Premium"
                        : "Free Trial"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {subscriptionStatus === "premium" ||
                    subscriptionStatus === "enterprise"
                      ? "Advanced analysis, unlimited usage"
                      : `今日剩余使用次数：${
                          activeTab === "analysis"
                            ? remainingUsage.analysis
                            : remainingUsage.coverLetter
                        } 次`}
                  </span>
                </label>
                <Sparkles className="h-4 w-4 text-gray-400 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* GPT-o1 */}
              <div
                className={`flex items-center space-x-2 border rounded-lg p-2.5 cursor-pointer relative overflow-hidden group transition-all duration-300 ${
                  selectedModel === "gpt-o1"
                    ? "border-black shadow-sm"
                    : "hover:border-gray-300"
                } ${
                  !isModelAvailable("gpt-o1")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  isModelAvailable("gpt-o1") && setSelectedModel("gpt-o1")
                }
                data-tooltip-id="gpt-o1-tooltip"
                data-tooltip-content="需要开通企业版才能使用此模型"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <input
                  type="radio"
                  id="gpt-o1"
                  name="model"
                  value="gpt-o1"
                  checked={selectedModel === "gpt-o1"}
                  onChange={() => setSelectedModel("gpt-o1")}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="gpt-o1"
                  className="flex flex-col cursor-pointer flex-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">GPT-o1</span>
                    <span className="text-[11px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                      Enterprise
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    Top-tier customized analysis
                  </span>
                </label>
                <Sparkles className="h-4 w-4 text-gray-400 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Selected:{" "}
              <span className="font-medium ml-1">{selectedModel}</span>
            </div>
          </div>
        </div>

        {activeTab === "analysis" && (
          <form onSubmit={handleSubmit} className="relative">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resume Selection Area - Enhanced Version */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col relative overflow-hidden group hover:border-gray-300 transition-colors">
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        Resume Selection
                      </h3>
                      <p className="text-sm text-gray-500">
                        Upload a new resume or select from existing ones
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Selection Method */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className={`flex items-center justify-center px-4 py-2 rounded-md text-sm ${
                            resumeSource === "upload"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setResumeSource("upload")}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload New Resume
                        </button>
                        <button
                          type="button"
                          className={`flex items-center justify-center px-4 py-2 rounded-md text-sm ${
                            resumeSource === "select"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setResumeSource("select")}
                        >
                          <History className="mr-2 h-4 w-4" />
                          Select Resume
                        </button>
                      </div>
                      {resumeSource === "select" && (
                        <div className="flex flex-col space-y-4">
                          {/* Quick Selection for Currently Active Resume */}
                          {resumeList.find((r) => r.isActive) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectResume(
                                  resumeList.find((r) => r.isActive)
                                )
                              }
                              className="relative w-full border border-gray-200 bg-white rounded-lg px-4 py-3 flex items-center"
                            >
                              <div className="mr-3 flex-shrink-0 rounded-full bg-green-100 p-2">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1 text-left">
                                <h5 className="font-semibold text-gray-800 text-sm">
                                  Use Currently Active Resume
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {resumeList.find((r) => r.isActive)?.name}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0 text-gray-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </button>
                          )}

                          {/* Select from Resume Library Button */}
                          <button
                            type="button"
                            onClick={() => setShowResumeDialog(true)}
                            className="relative w-full border border-gray-200 bg-white rounded-lg px-4 py-3 flex items-center"
                          >
                            <div className="mr-3 flex-shrink-0 rounded-full bg-gray-100 p-2">
                              <History className="h-4 w-4 text-gray-700" />
                            </div>
                            <div className="flex-1 text-left">
                              <h5 className="font-semibold text-gray-800 text-sm">
                                Select from Resume Library
                              </h5>
                              <p className="text-xs text-gray-500">
                                You have {resumeList.length} saved resumes
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </button>

                          <div className="border-t border-gray-200 w-full"></div>
                        </div>
                      )}

                      {/* Upload New Resume */}
                      {resumeSource === "upload" && (
                        <div className="flex flex-col items-center justify-center text-center py-4">
                          <input
                            type="file"
                            id="resume-upload"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) =>
                              handleUploadResume(e.target.files[0])
                            }
                            disabled={!!selectedResume}
                          />
                          <label
                            htmlFor="resume-upload"
                            className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                          >
                            <Upload className="h-10 w-10 text-gray-400 mb-4 group-hover:text-gray-600 transition-colors" />
                            <p className="text-sm text-gray-500 mb-4">
                              Supports PDF, DOCX formats
                            </p>
                          </label>
                        </div>
                      )}

                      {/* Selected Resume Display */}
                      {(uploadedResume || selectedResume) && (
                        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">
                                  {uploadedResume
                                    ? uploadedResume.name
                                    : selectedResume?.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {uploadedResume
                                    ? `${(uploadedResume.size / 1024).toFixed(
                                        0
                                      )}KB`
                                    : selectedResume?.size}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={handleRemoveResume}
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Description Input Area */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col relative overflow-hidden group hover:border-gray-300 transition-colors">
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        Job Description
                      </h3>
                      <p className="text-sm text-gray-500">
                        Paste or enter job description
                      </p>
                    </div>
                    <textarea
                      placeholder="Paste or enter job description here..."
                      className="h-full resize-none flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white px-8 py-2 relative overflow-hidden group"
                    disabled={!isAuthenticated || loading || !resume || !jd}
                  >
                    <span className="relative z-10">
                      {loading ? "Analyzing..." : "Start Analysis"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
                {!isAuthenticated && (
                  <div className="mt-2 text-sm text-gray-500 text-center">
                    Please log in to use the resume analysis feature
                  </div>
                )}
              </div>
            </div>
            {loading && (
              <LoadingMaskAI
                step={step}
                analysisLines={analysisLines}
                currentLine={currentLine}
                model={
                  selectedModel === "gpt-4o"
                    ? "GPT-4o"
                    : selectedModel === "gpt-o1"
                    ? "GPT-o1"
                    : "Gemini 2.0 Flash"
                }
              />
            )}
          </form>
        )}

        {activeTab === "coverletter" && (
          <form
            id="coverletter-form"
            onSubmit={handleCoverLetterSubmit}
            className="relative"
          >
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resume Selection Area - Matching Analysis Module */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col relative overflow-hidden group hover:border-gray-300 transition-colors">
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        Resume Selection
                      </h3>
                      <p className="text-sm text-gray-500">
                        Upload a new resume or select from existing ones
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Selection Method */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className={`flex items-center justify-center px-4 py-2 rounded-md text-sm ${
                            resumeSource === "upload"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setResumeSource("upload")}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload New Resume
                        </button>
                        <button
                          type="button"
                          className={`flex items-center justify-center px-4 py-2 rounded-md text-sm ${
                            resumeSource === "select"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setResumeSource("select")}
                        >
                          <History className="mr-2 h-4 w-4" />
                          Select Resume
                        </button>
                      </div>
                      {resumeSource === "select" && (
                        <div className="flex flex-col space-y-4">
                          {/* Quick Selection of Currently Active Resume */}
                          {resumeList.find((r) => r.isActive) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectResume(
                                  resumeList.find((r) => r.isActive)
                                )
                              }
                              className="relative w-full border border-gray-200 bg-white rounded-lg px-4 py-3 flex items-center"
                            >
                              <div className="mr-3 flex-shrink-0 rounded-full bg-green-100 p-2">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1 text-left">
                                <h5 className="font-semibold text-gray-800 text-sm">
                                  Use Currently Active Resume
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {resumeList.find((r) => r.isActive)?.name}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0 text-gray-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </button>
                          )}

                          {/* Select from Resume Library Button */}
                          <button
                            type="button"
                            onClick={() => setShowResumeDialog(true)}
                            className="relative w-full border border-gray-200 bg-white rounded-lg px-4 py-3 flex items-center"
                          >
                            <div className="mr-3 flex-shrink-0 rounded-full bg-gray-100 p-2">
                              <History className="h-4 w-4 text-gray-700" />
                            </div>
                            <div className="flex-1 text-left">
                              <h5 className="font-semibold text-gray-800 text-sm">
                                Select from Resume Library
                              </h5>
                              <p className="text-xs text-gray-500">
                                You have {resumeList.length} saved resumes
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </button>

                          <div className="border-t border-gray-200 w-full"></div>
                        </div>
                      )}

                      {/* Upload New Resume */}
                      {resumeSource === "upload" && (
                        <div className="flex flex-col items-center justify-center text-center py-4">
                          <input
                            type="file"
                            id="resume-upload-cl"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) =>
                              handleUploadResume(e.target.files[0])
                            }
                            disabled={!!selectedResume}
                          />
                          <label
                            htmlFor="resume-upload-cl"
                            className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                          >
                            <Upload className="h-10 w-10 text-gray-400 mb-4 group-hover:text-gray-600 transition-colors" />
                            <p className="text-sm text-gray-500 mb-4">
                              Supports PDF, DOCX formats
                            </p>
                          </label>
                        </div>
                      )}

                      {/* Selected Resume Display */}
                      {(uploadedResume || selectedResume) && (
                        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">
                                  {uploadedResume
                                    ? uploadedResume.name
                                    : selectedResume?.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {uploadedResume
                                    ? `${(uploadedResume.size / 1024).toFixed(
                                        0
                                      )}KB`
                                    : selectedResume?.size}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={handleRemoveResume}
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Description Input Area */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col relative overflow-hidden group hover:border-gray-300 transition-colors">
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        Job Description
                      </h3>
                      <p className="text-sm text-gray-500">
                        Paste or enter job description
                      </p>
                    </div>
                    <textarea
                      placeholder="Paste or enter job description here..."
                      className="h-full resize-none flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white px-8 py-2 relative overflow-hidden group"
                    disabled={!isAuthenticated || loading || !resume || !jd}
                  >
                    <span className="relative z-10">
                      {loading ? "Analyzing..." : "Start Analysis"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
                {!isAuthenticated && (
                  <div className="mt-2 text-sm text-gray-500 text-center">
                    Please log in to use the resume analysis feature
                  </div>
                )}
              </div>
            </div>
            {loading && activeTab === "coverletter" && (
              <LoadingMaskAI
                type="coverletter"
                step={step}
                model={
                  selectedModel === "gpt-4o"
                    ? "GPT-4o"
                    : selectedModel === "gpt-o1"
                    ? "GPT-o1"
                    : "Gemini 2.0 Flash"
                }
              />
            )}
          </form>
        )}
      </div>
      <Tooltip id="gpt-3.5-tooltip" />
      <Tooltip id="gpt-4o-tooltip" />
      <Tooltip id="gpt-o1-tooltip" />
      <Tooltip id="claude-3.5-tooltip" />
      {showResumeDialog && (
        <ResumeSelectDialog
          onSelect={handleSelectResume}
          resumeList={resumeList}
        />
      )}
    </section>
  );
}
