import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Cpu, Sparkles, Upload, FileText } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import LoadingMaskAI from "./LoadingMaskAI";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";

export default function UploadSection() {
  const [activeTab, setActiveTab] = useState("analysis");
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
  const { subscriptionType } = useSelector((state) => state.user);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const userFeatures = useSelector(
    (state) =>
      state.user.features || {
        gpt3_5: false,
        gpt4o: false,
        claude: false,
      }
  );
  const dispatch = useDispatch();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!resume || !jd) {
      setError("请上传简历并填写JD");
      return;
    }
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      setStep(1);
      console.log("[前端] 开始上传并解析简历...");
      const formData = new FormData();
      formData.append("resume", resume);
      const token = localStorage.getItem("token");
      const resumeRes = await axios.post("/api/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[前端] 简历解析完成", resumeRes.data);
      const resumeObj = resumeRes.data.data;
      setResumeData(resumeObj);

      setStep(2);
      console.log("[前端] 开始解析JD...");
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
      setJdData(jdObj);

      setStep(3);
      console.log("jdObj", jdObj._id);
      console.log("resumeObj", resumeObj._id);
      const analysisRes = await axios.post(
        "/api/analysis",
        {
          jobId: jdObj._id,
          resumeId: resumeObj._id,
          model: selectedModel,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("[前端] 智能匹配分析完成", analysisRes.data);
      const analysisId = analysisRes.data.data._id;
      console.log("analysis参数", {
        jobId: jdObj._id,
        resumeId: resumeObj._id,
      });
      const modelType = analysisRes.data.model || "gemini"; // 默认使用 gemini
      if (modelType === "gpt4o") {
        navigate(`/analysis/gpt4o/${analysisId}`);
      } else {
        navigate(`/analysis/gemini/${analysisId}`);
      }
    } catch (err) {
      setError("分析失败：" + (err.response?.data?.message || err.message));
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const isModelAvailable = (model) => {
    if (model === "gemini-2.0-flash") return true; // Gemini始终可用
    if (subscriptionType === "enterprise") return true;
    if (subscriptionType === "premium" && model === "gpt-3.5") return true;
    return false;
  };

  const getModelTooltip = (model) => {
    if (model === "gemini-2.0-flash") return "";
    if (!isModelAvailable(model)) {
      return "需要购买会员才能解锁此模型";
    }
    return "";
  };

  return (
    <section id="start" className="w-full py-20 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">开始使用 TalentSync</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            上传您的简历和职位描述，选择合适的AI模型，让TalentSync为您提供专业分析和建议
          </p>
        </div>

        {/* AI Model Selector with animated background */}
        <div className="mb-10 overflow-hidden relative rounded-lg border border-gray-200 bg-white shadow-sm">
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
              <h3 className="text-xl font-semibold">选择AI模型</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer relative overflow-hidden group ${
                  selectedModel === "gemini-2.0-flash" ? "border-black" : ""
                }`}
                onClick={() => setSelectedModel("gemini-2.0-flash")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                  className="flex flex-col cursor-pointer"
                >
                  <span className="font-medium">Gemini 2.0 Flash</span>
                  <span className="text-xs text-gray-500">技术职位分析</span>
                </label>
                <Sparkles className="h-4 w-4 text-gray-400 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div
                className={`flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer relative overflow-hidden group ${
                  selectedModel === "gpt-3.5" ? "border-black" : ""
                } ${
                  !isModelAvailable("gpt-3.5")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  isModelAvailable("gpt-3.5") && setSelectedModel("gpt-3.5")
                }
                data-tooltip-id="gpt-3.5-tooltip"
                data-tooltip-content={getModelTooltip("gpt-3.5")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input
                  type="radio"
                  id="gpt-3.5"
                  name="model"
                  value="gpt-3.5"
                  checked={selectedModel === "gpt-3.5"}
                  onChange={() => setSelectedModel("gpt-3.5")}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="gpt-3.5"
                  className="flex flex-col cursor-pointer"
                >
                  <span className="font-medium">GPT-3.5</span>
                  <span className="text-xs text-gray-500">快速分析</span>
                </label>
                <Sparkles className="h-4 w-4 text-gray-400 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div
                className={`flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer relative overflow-hidden group ${
                  selectedModel === "gpt-4o" ? "border-black" : ""
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
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input
                  type="radio"
                  id="gpt-4o"
                  name="model"
                  value="gpt-4o"
                  checked={selectedModel === "gpt-4o"}
                  onChange={() => setSelectedModel("gpt-4o")}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="gpt-4o"
                  className="flex flex-col cursor-pointer"
                >
                  <span className="font-medium">GPT-4o</span>
                  <span className="text-xs text-gray-500">
                    最强大的分析能力
                  </span>
                </label>
                <Sparkles className="h-4 w-4 text-gray-400 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div
                className={`flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer relative overflow-hidden group ${
                  selectedModel === "claude-3.5" ? "border-black" : ""
                } ${
                  !isModelAvailable("claude-3.5")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  isModelAvailable("claude-3.5") &&
                  setSelectedModel("claude-3.5")
                }
                data-tooltip-id="claude-3.5-tooltip"
                data-tooltip-content={getModelTooltip("claude-3.5")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input
                  type="radio"
                  id="claude"
                  name="model"
                  value="claude-3.5"
                  checked={selectedModel === "claude-3.5"}
                  onChange={() => setSelectedModel("claude-3.5")}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="claude"
                  className="flex flex-col cursor-pointer"
                >
                  <span className="font-medium">Claude 3.5</span>
                  <span className="text-xs text-gray-500">创意写作</span>
                </label>
                <Sparkles className="h-4 w-4 text-gray-400 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              已选择: <span className="font-medium ml-1">{selectedModel}</span>
            </div>
          </div>
        </div>

        <div className="w-full mb-8">
          <div className="flex">
            <button
              className={`px-4 py-2 text-center w-1/2 ${
                activeTab === "analysis"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("analysis")}
            >
              简历分析
            </button>
            <button
              className={`px-4 py-2 text-center w-1/2 ${
                activeTab === "coverletter"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("coverletter")}
            >
              求职信生成
            </button>
          </div>
        </div>

        {activeTab === "analysis" && (
          <form onSubmit={handleSubmit} className="relative">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-gray-300 transition-colors"
                    style={{ minHeight: "200px" }}
                  >
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResume(e.target.files[0])}
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                    >
                      <Upload className="h-10 w-10 text-gray-400 mb-4 group-hover:text-gray-600 transition-colors" />
                      <h3 className="text-lg font-medium mb-2">上传您的简历</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        支持 PDF, DOCX 格式
                      </p>
                      {resume && (
                        <div className="mt-4 text-sm text-green-600">
                          已选择: {resume.name}
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col text-center relative overflow-hidden group hover:border-gray-300 transition-colors">
                    <FileText className="h-10 w-10 text-gray-400 mb-4 mx-auto group-hover:text-gray-600 transition-colors" />
                    <h3 className="text-lg font-medium mb-2">输入职位描述</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      粘贴JD或手动输入
                    </p>
                    <textarea
                      placeholder="在此粘贴或输入职位描述..."
                      className="min-h-[120px] resize-none flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white px-8 py-2 relative overflow-hidden group"
                    disabled={!isAuthenticated || loading}
                  >
                    <span className="relative z-10">
                      {loading ? "分析中..." : "开始分析"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
                {!isAuthenticated && (
                  <div className="mt-2 text-sm text-gray-500 text-center">
                    请先登录后再使用简历分析功能
                  </div>
                )}
              </div>
            </div>
            {loading && (
              <LoadingMaskAI
                step={step}
                analysisLines={analysisLines}
                currentLine={currentLine}
              />
            )}
          </form>
        )}

        {activeTab === "coverletter" && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-gray-300 transition-colors"
                  style={{ minHeight: "200px" }}
                >
                  <input
                    type="file"
                    id="resume-upload-cl"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files[0])}
                  />
                  <label
                    htmlFor="resume-upload-cl"
                    className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-4 group-hover:text-gray-600 transition-colors" />
                    <h3 className="text-lg font-medium mb-2">上传您的简历</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      支持 PDF, DOCX 格式
                    </p>
                    {resume && (
                      <div className="mt-4 text-sm text-green-600">
                        已选择: {resume.name}
                      </div>
                    )}
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col text-center relative overflow-hidden group hover:border-gray-300 transition-colors">
                  <FileText className="h-10 w-10 text-gray-400 mb-4 mx-auto group-hover:text-gray-600 transition-colors" />
                  <h3 className="text-lg font-medium mb-2">输入职位描述</h3>
                  <p className="text-sm text-gray-500 mb-4">粘贴JD或手动输入</p>
                  <textarea
                    placeholder="在此粘贴或输入职位描述..."
                    className="min-h-[120px] resize-none flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  form="coverletter-form"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white px-8 py-2 relative overflow-hidden group"
                  disabled={!isAuthenticated || loading}
                >
                  <span className="relative z-10">
                    {loading ? "生成中..." : "生成求职信"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
              {!isAuthenticated && (
                <div className="mt-2 text-sm text-gray-500 text-center">
                  请先登录后再使用求职信生成功能
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Tooltip id="gpt-3.5-tooltip" />
      <Tooltip id="gpt-4o-tooltip" />
      <Tooltip id="claude-3.5-tooltip" />
    </section>
  );
}
