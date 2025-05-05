"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  BarChart2,
  Award,
  Briefcase,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 可折叠部分组件
const CollapsibleSection = ({ title, isExpanded, toggle, icon, children }) => (
  <div className="mb-8 text-left">
    <div
      className="flex items-center justify-between cursor-pointer border-b border-gray-200 pb-2 mb-4"
      onClick={toggle}
    >
      <div className="flex items-center">
        {icon && <span className="text-black mr-2">{icon}</span>}
        <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
      </div>
      <div>
        {isExpanded ? (
          <ChevronUp className="text-gray-500" />
        ) : (
          <ChevronDown className="text-gray-500" />
        )}
      </div>
    </div>

    {isExpanded && (
      <div className="pl-4 border-l-2 border-gray-200">{children}</div>
    )}
  </div>
);

const renderSafely = (item) => {
  if (item === null || item === undefined) {
    return "无数据";
  }

  if (typeof item === "object") {
    // 处理格式化问题对象
    if (item.problem || item.original || item.suggested) {
      return (
        <div>
          {item.problem && <p className="font-medium">{item.problem}</p>}
          {item.original && (
            <p className="text-sm mt-1">原文: {item.original}</p>
          )}
          {item.suggested && (
            <p className="text-sm mt-1 text-green-600">
              建议: {item.suggested}
            </p>
          )}
        </div>
      );
    }

    // 处理其他类型的对象
    if (item.name) return item.name;
    if (item.text) return item.text;
    if (item.value) return item.value;
    if (item.message) return item.message;

    // 最后的手段，转为字符串
    return JSON.stringify(item);
  }

  // 直接返回非对象值
  return item;
};

export default function GeminiAnalysisReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    atsAnalysis: true,
    rankingAnalysis: true,
    hrAnalysis: true,
    technicalAnalysis: true,
    recommendations: true,
  });
  const reportRef = useRef(null);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysis(response.data);
      setLoading(false);
    } catch (err) {
      console.error("获取分析失败:", err);
      setError(err.response?.data?.message || "获取分析结果失败");
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // 下载PDF报告
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / imgWidth;
      const pageHeightPx = pdfHeight / ratio;

      let renderedHeight = 0;
      let pageNum = 0;

      while (renderedHeight < imgHeight) {
        // 创建一个临时canvas，裁剪当前页
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = Math.min(pageHeightPx, imgHeight - renderedHeight);
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          imgWidth,
          pageCanvas.height,
          0,
          0,
          imgWidth,
          pageCanvas.height
        );
        const pageData = pageCanvas.toDataURL("image/png");

        if (pageNum > 0) pdf.addPage();
        pdf.addImage(
          pageData,
          "PNG",
          0,
          0,
          pdfWidth,
          pageCanvas.height * ratio
        );
        renderedHeight += pageHeightPx;
        pageNum++;
      }
      pdf.save(`简历分析报告_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error("生成PDF失败:", error);
      alert("生成PDF失败，请重试");
    }
  };

  // 打印报告
  const handlePrint = () => {
    window.print();
  };

  // 分享报告
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "简历分析报告",
          text: `查看我的简历匹配分数: ${
            analysis?.ats_analysis?.match_score_percent || 0
          }%`,
          url: window.location.href,
        })
        .catch((error) => console.error("分享失败:", error));
    } else {
      // 复制链接到剪贴板
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("链接已复制到剪贴板"))
        .catch((err) => console.error("复制失败:", err));
    }
  };

  // 返回按钮
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <span className="ml-3 text-black">正在加载分析结果...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="text-red-500 text-xl mt-0.5 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-red-800">加载失败</h3>
              <p className="text-red-700">{error}</p>
              <button
                className="mt-2 text-red-600 hover:underline"
                onClick={handleBack}
              >
                返回
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // 确保所有数据有默认值，防止map函数报错
  const safeAnalysis = analysis || {};
  const atsData = safeAnalysis.ats_analysis || {};
  const rankingData = safeAnalysis.ranking_analysis || {};
  const hrData = safeAnalysis.hr_analysis || {};
  const technicalData = safeAnalysis.technical_analysis || {};

  // 计算候选人排名百分比
  const rankPercentile = rankingData.predicted_rank_percentile || 0;
  const topPercentage = 100 - rankPercentile;

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-8 print:p-0">
        {/* 标题栏 */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 print:hidden">
          <div className="flex items-center">
            <FileText className="text-black mr-2 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">简历分析报告</h2>
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <Info className="mr-1" /> 匹配度{" "}
              {atsData.match_score_percent || 0}%
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="hidden md:flex text-white hover:bg-gray-800 bg-black px-3 py-1.5 rounded-lg items-center text-sm"
            >
              <Download className="mr-1.5" /> 下载PDF
            </button>
            <button
              onClick={handlePrint}
              className="hidden md:flex text-black hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded-lg items-center text-sm"
            >
              <Printer className="mr-1.5" /> 打印
            </button>
            <button
              onClick={handleShare}
              className="hidden md:flex text-black hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded-lg items-center text-sm"
            >
              <Share2 className="mr-1.5" /> 分享
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div
          className="p-4 md:p-6 rounded-lg mt-4 print:p-0"
          ref={reportRef}
          id="report-container"
        >
          {/* ATS分析 */}
          <CollapsibleSection
            title="🟢 [1] ATS 系统分析结果（自动筛选视角）"
            isExpanded={expandedSections.atsAnalysis}
            toggle={() => toggleSection("atsAnalysis")}
            icon={<BarChart2 />}
          >
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">✅ 匹配评分</h4>
                <p>关键词匹配分数：{atsData.match_score_percent || 0}%</p>
                <p className="mt-2">
                  预计通过 ATS 筛选的概率：
                  {Math.round((atsData.ats_pass_probability || 0) * 100)}%
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">✅ 命中关键词（已覆盖）</h4>
                <div className="flex flex-wrap gap-2">
                  {(atsData.keywords_hit || []).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  ⚠️ 缺失关键词（JD 要求但简历中未提及）
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(atsData.keywords_missing || []).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">✅ 格式合规性检查</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <span>Bullet 列表使用</span>
                    <span className="ml-auto">
                      {atsData.format_check?.bullets ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>有明确分区标题</span>
                    <span className="ml-auto">
                      {atsData.format_check?.section_headers ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>字体一致</span>
                    <span className="ml-auto">
                      {atsData.format_check?.fonts_consistent ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>动词驱动句式</span>
                    <span className="ml-auto">
                      {atsData.format_check?.verb_driven ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>技术-成果-影响三段式</span>
                    <span className="ml-auto">
                      {atsData.format_check?.tech_result_impact ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">💡 建议改进项</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {(atsData.improvement_suggestions || []).map(
                    (suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* 排名分析 */}
          <CollapsibleSection
            title="🔵 [2] 排名分析（与竞争者对比）"
            isExpanded={expandedSections.rankingAnalysis}
            toggle={() => toggleSection("rankingAnalysis")}
            icon={<Award />}
          >
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">📊 排名评估</h4>
                <p>
                  预计申请总人数：{rankingData.estimated_total_applicants || 0}{" "}
                  人
                </p>
                <p className="mt-1">
                  你在申请者中排位：前 {topPercentage}%（{rankPercentile}%
                  分位）
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">⚠️ 与 Top 5% 候选人差距</h4>
                {(rankingData.top_5_diff || []).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">分类</th>
                          <th className="py-2 text-left">你的情况</th>
                          <th className="py-2 text-left">顶级候选人</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rankingData.top_5_diff || []).map((diff, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{diff.category}</td>
                            <td className="py-2">{diff.yours}</td>
                            <td className="py-2">{diff.top_candidates}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>无明显差距数据</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">📈 提升建议</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {(rankingData.rank_boost_suggestions || []).map(
                    (suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* HR视角分析 */}
          <CollapsibleSection
            title="🟣 [3] HR 视角分析"
            isExpanded={expandedSections.hrAnalysis}
            toggle={() => toggleSection("hrAnalysis")}
            icon={<Briefcase />}
          >
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">📝 第一印象</h4>
                <p>评价："{hrData.initial_impression}"</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">✅ 是否推荐面试？</h4>
                <div
                  className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                    hrData.recommend_interview
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {hrData.recommend_interview
                    ? "是（Recommend Interview = true）"
                    : "否（Recommend Interview = false）"}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">🎯 推荐理由</h4>
                <p>{hrData.why_or_why_not}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">✏️ 表达问题</h4>
                {(hrData.expression_issues || []).length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {(hrData.expression_issues || []).map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                        {renderSafely(issue)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>无明显语言或表达问题（表达结构良好）</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">📌 当前市场提醒</h4>
                <p>"{hrData.market_reminder}"</p>
              </div>
            </div>
          </CollapsibleSection>

          {/* 技术面试官视角 */}
          <CollapsibleSection
            title="🔴 [4] 技术面试官视角分析"
            isExpanded={expandedSections.technicalAnalysis}
            toggle={() => toggleSection("technicalAnalysis")}
            icon={<MessageSquare />}
          >
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">🔍 信任度评估</h4>
                <p>
                  技术可信度评级：
                  {technicalData.trust_level === "high"
                    ? "高"
                    : technicalData.trust_level === "medium"
                    ? "中"
                    : "低"}
                  （{technicalData.trust_level}）
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">⚠️ 潜在风险点</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {(technicalData.red_flags || []).map((flag, index) => (
                    <li key={index}>{renderSafely(flag)}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">❓ 可能被问到的问题：</h4>
                {(technicalData.expected_tech_questions || []).map(
                  (item, index) => (
                    <div
                      key={index}
                      className="mb-3 pl-4 border-l-2 border-gray-200"
                    >
                      <p className="font-medium">→ 项目：{item.project}</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        {(item.questions || []).map((q, qIndex) => (
                          <li key={qIndex} className="flex items-start">
                            <MessageSquare className="text-black mt-1 mr-2 flex-shrink-0" />
                            {renderSafely(q)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">💡 技术改进建议</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {(technicalData.technical_improvement || []).map(
                    (improvement, index) => (
                      <li key={index}>{renderSafely(improvement)}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">✅ 项目部署情况</h4>
                  <p>
                    部署已验证：
                    {technicalData.project_deployment_verified
                      ? "是，项目真实上线"
                      : "否"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">🧠 数据处理复杂度</h4>
                  <p>
                    {technicalData.data_complexity}
                    （项目有一定数据结构/访问层设计）
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 总结 */}
          <CollapsibleSection
            title="✅ 总结"
            isExpanded={expandedSections.recommendations}
            toggle={() => toggleSection("recommendations")}
            icon={<Info />}
          >
            <div className="space-y-4 text-gray-700">
              <p className="font-medium">
                你是一个处于 Top {topPercentage}% 的
                {technicalData.project_deployment_verified
                  ? "有实际部署经验的"
                  : ""}
                {technicalData.trust_level === "high" ? "强" : "合格"}
                技术候选人， 目前的最大短板是：
              </p>

              <ul className="list-disc pl-5 space-y-1">
                {(technicalData.red_flags || []).map((item, index) => (
                  <li key={index}>{renderSafely(item)}</li>
                ))}
              </ul>

              {topPercentage > 5 && (
                <p className="text-black font-medium">
                  若补足这部分，你有机会进入 Top 5%。
                </p>
              )}

              <div className="mt-4 pl-4 border-l-2 border-gray-200">
                <h4 className="font-medium mb-2">下一步行动建议</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {(rankingData.rank_boost_suggestions || []).map(
                    (suggestion, index) => (
                      <li key={index}>{renderSafely(suggestion)}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-200 flex justify-between mt-4 print:hidden">
          <button
            onClick={handleBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition"
          >
            <ArrowLeft className="inline mr-2" /> 返回
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition flex items-center"
            >
              <Download className="mr-2" /> 下载PDF
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition flex items-center"
            >
              <Printer className="mr-2" /> 打印
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
