import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiFileText,
  FiArrowLeft,
  FiDownload,
  FiPrinter,
  FiShare2,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertCircle,
  FiBarChart2,
  FiAward,
  FiBriefcase,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 可折叠部分组件 - 与简历预览风格一致
const CollapsibleSection = ({
  title,
  isExpanded,
  toggle,
  icon,
  color = "indigo",
  children,
}) => (
  <div className="mb-8 text-left">
    <div
      className="flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700 pb-2 mb-4"
      onClick={toggle}
    >
      <div className="flex items-center">
        {icon && (
          <span className={`text-${color}-500 dark:text-${color}-400 mr-2`}>
            {icon}
          </span>
        )}
        <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h4>
      </div>
      <div>
        {isExpanded ? (
          <FiChevronUp className="text-gray-500 dark:text-gray-400" />
        ) : (
          <FiChevronDown className="text-gray-500 dark:text-gray-400" />
        )}
      </div>
    </div>

    {isExpanded && (
      <div
        className={`pl-4 border-l-2 border-${color}-200 dark:border-${color}-800`}
      >
        {children}
      </div>
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
            <p className="text-sm mt-1 text-green-600 dark:text-green-400">
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

const AnalysisResultPage = () => {
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

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
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
          text: `查看我的简历匹配分数: ${analysis?.matchScore || 0}%`,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-indigo-500">正在加载分析结果...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex">
            <FiAlertCircle className="text-red-500 text-xl mt-0.5 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
                加载失败
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                className="mt-2 text-red-600 dark:text-red-400 hover:underline"
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
    <div
      className="container mx-auto max-w-4xl px-4 py-8 print:p-0"
      ref={reportRef}
      id="report-container"
    >
      {/* 标题栏 - 类似于简历预览 */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 print:hidden">
        <div className="flex items-center">
          <FiFileText className="text-indigo-500 dark:text-indigo-400 mr-2 text-xl" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            简历分析报告
          </h2>
          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            <FiInfo className="mr-1" /> 匹配度{" "}
            {atsData.match_score_percent || 0}%
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="hidden md:flex text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg items-center text-sm"
          >
            <FiDownload className="mr-1.5" /> 下载PDF
          </button>
          <button
            onClick={handlePrint}
            className="hidden md:flex text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg items-center text-sm"
          >
            <FiPrinter className="mr-1.5" /> 打印
          </button>
          <button
            onClick={handleShare}
            className="hidden md:flex text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg items-center text-sm"
          >
            <FiShare2 className="mr-1.5" /> 分享
          </button>
        </div>
      </div>

      {/* 内容区域 - 类似于简历预览 */}
      <div className="p-4 md:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-left print:p-0">
        {/* ATS分析 */}
        <CollapsibleSection
          title="🟢 [1] ATS 系统分析结果（自动筛选视角）"
          isExpanded={expandedSections.atsAnalysis}
          toggle={() => toggleSection("atsAnalysis")}
          icon={<FiBarChart2 />}
          color="green"
        >
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
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
                    className="inline-block px-3 py-1 text-sm rounded-md bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
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
                    className="inline-block px-3 py-1 text-sm rounded-md bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
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
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiXCircle className="text-red-500" />
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>有明确分区标题</span>
                  <span className="ml-auto">
                    {atsData.format_check?.section_headers ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiXCircle className="text-red-500" />
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>字体一致</span>
                  <span className="ml-auto">
                    {atsData.format_check?.fonts_consistent ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiXCircle className="text-red-500" />
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>动词驱动句式</span>
                  <span className="ml-auto">
                    {atsData.format_check?.verb_driven ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiXCircle className="text-red-500" />
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>技术-成果-影响三段式</span>
                  <span className="ml-auto">
                    {atsData.format_check?.tech_result_impact ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiXCircle className="text-red-500" />
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
          icon={<FiAward />}
          color="blue"
        >
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-medium mb-2">📊 排名评估</h4>
              <p>
                预计申请总人数：{rankingData.estimated_total_applicants || 0} 人
              </p>
              <p className="mt-1">
                你在申请者中排位：前 {topPercentage}%（{rankPercentile}% 分位）
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">⚠️ 与 Top 5% 候选人差距</h4>
              {(rankingData.top_5_diff || []).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="py-2 text-left">分类</th>
                        <th className="py-2 text-left">你的情况</th>
                        <th className="py-2 text-left">顶级候选人</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rankingData.top_5_diff || []).map((diff, index) => (
                        <tr
                          key={index}
                          className="border-b dark:border-gray-700"
                        >
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
          icon={<FiBriefcase />}
          color="purple"
        >
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-medium mb-2">📝 第一印象</h4>
              <p>评价："{hrData.initial_impression}"</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">✅ 是否推荐面试？</h4>
              <div
                className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                  hrData.recommend_interview
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
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
                      <FiAlertCircle className="text-amber-500 mt-1 mr-2 flex-shrink-0" />
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
          icon={<FiMessageSquare />}
          color="red"
        >
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
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
                    className="mb-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700"
                  >
                    <p className="font-medium">→ 项目：{item.project}</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      {(item.questions || []).map((q, qIndex) => (
                        <li key={qIndex} className="flex items-start">
                          <FiMessageSquare className="text-indigo-500 mt-1 mr-2 flex-shrink-0" />
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
          icon={<FiInfo />}
          color="amber"
        >
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="font-medium">
              你是一个处于 Top {topPercentage}% 的
              {technicalData.project_deployment_verified
                ? "有实际部署经验的"
                : ""}
              {technicalData.trust_level === "high" ? "强" : "合格"}技术候选人，
              目前的最大短板是：
            </p>

            <ul className="list-disc pl-5 space-y-1">
              {(technicalData.red_flags || []).map((item, index) => (
                <li key={index}>{renderSafely(item)}</li>
              ))}
            </ul>

            {topPercentage > 5 && (
              <p className="text-indigo-600 dark:text-indigo-400">
                若补足这部分，你有机会进入 Top 5%。
              </p>
            )}

            <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
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

      {/* 底部按钮 - 类似于简历预览 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between print:hidden">
        <button
          onClick={handleBack}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition"
        >
          <FiArrowLeft className="inline mr-2" /> 返回
        </button>

        <div className="flex space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center"
          >
            <FiDownload className="mr-2" /> 下载PDF
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center"
          >
            <FiPrinter className="mr-2" /> 打印
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
