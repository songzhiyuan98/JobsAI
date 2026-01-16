"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

export default function Gpt4oAnalysisReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    gapAnalysis: true,
    opportunities: true,
    improvements: true,
    development: true,
  });
  const reportRef = useRef(null);

  const fetchAnalysis = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

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
          text: `查看我的简历分析报告`,
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

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-8 print:p-0">
        {/* 标题栏 */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 print:hidden">
          <div className="flex items-center">
            <FileText className="text-black mr-2 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">
              GPT-4o 深度简历分析报告
            </h2>
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
          {/* 总体分析 */}
          <CollapsibleSection
            title="🟢 [1] 总体洞察"
            isExpanded={expandedSections.summary}
            toggle={() => toggleSection("summary")}
            icon={<Info className="text-blue-600" />}
          >
            <div className="space-y-2 text-gray-700">
              <h4 className="font-semibold text-lg">核心结论</h4>
              <p className="text-base">{analysis.summary}</p>
            </div>
          </CollapsibleSection>

          {/* 差距分析 */}
          <CollapsibleSection
            title="🔵 [2] 技术/业务/表达差距"
            isExpanded={expandedSections.gapAnalysis}
            toggle={() => toggleSection("gapAnalysis")}
            icon={<BarChart2 className="text-amber-600" />}
          >
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium flex items-center mb-1">
                  <XCircle className="text-red-500 mr-2" /> 技术匹配差距
                </h4>
                <ul className="list-disc pl-6">
                  {(analysis.gapAnalysis.technicalGaps || []).map((gap, i) => (
                    <li key={i}>{renderSafely(gap)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium flex items-center mb-1">
                  <AlertCircle className="text-yellow-500 mr-2" /> 业务理解差距
                </h4>
                <ul className="list-disc pl-6">
                  {(analysis.gapAnalysis.businessGaps || []).map((gap, i) => (
                    <li key={i}>{renderSafely(gap)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium flex items-center mb-1">
                  <MessageSquare className="text-gray-500 mr-2" /> 简历表达差距
                </h4>
                <ul className="list-disc pl-6">
                  {(analysis.gapAnalysis.resumeGaps || []).map((gap, i) => (
                    <li key={i}>{renderSafely(gap)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium flex items-center mb-1">
                  <FileText className="text-purple-500 mr-2" /> 关键词覆盖缺失
                </h4>
                <ul className="list-disc pl-6">
                  {(analysis.gapAnalysis.keywordGaps || []).map((gap, i) => (
                    <li key={i}>{renderSafely(gap)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* 机会亮点 */}
          <CollapsibleSection
            title="🟣 [3] 机会亮点"
            isExpanded={expandedSections.opportunities}
            toggle={() => toggleSection("opportunities")}
            icon={<Award className="text-green-600" />}
          >
            <div className="space-y-2 text-gray-700">
              <h4 className="font-semibold text-lg">你的独特优势</h4>
              <ul className="list-disc pl-6">
                {(analysis.opportunityHighlights || []).map((highlight, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="text-green-500 mr-2 mt-1" />
                    {renderSafely(highlight)}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleSection>

          {/* 战略改进建议 */}
          <CollapsibleSection
            title="🔴 [4] 战略改进建议"
            isExpanded={expandedSections.improvements}
            toggle={() => toggleSection("improvements")}
            icon={<MessageSquare className="text-indigo-600" />}
          >
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium flex items-center mb-1">
                  <FileText className="text-blue-400 mr-2" /> 简历修改建议
                </h4>
                <ul className="list-disc pl-6">
                  {(analysis.strategicImprovements.resumeSuggestions || []).map(
                    (s, i) => (
                      <li key={i}>{renderSafely(s)}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium flex items-center mb-1">
                  <FileText className="text-pink-400 mr-2" /> Cover Letter
                  推荐内容
                </h4>
                <ul className="list-disc pl-6">
                  {(
                    analysis.strategicImprovements.coverLetterSuggestions || []
                  ).map((s, i) => (
                    <li key={i}>{renderSafely(s)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium flex items-center mb-1">
                  <Briefcase className="text-orange-400 mr-2" /> 面试预判重点
                </h4>
                <ul className="list-disc pl-6">
                  {(analysis.strategicImprovements.interviewFocus || []).map(
                    (s, i) => (
                      <li key={i}>{renderSafely(s)}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* 长期发展计划 */}
          <CollapsibleSection
            title="✅ [5] 长期发展建议"
            isExpanded={expandedSections.development}
            toggle={() => toggleSection("development")}
            icon={<Briefcase className="text-gray-700" />}
          >
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">建议提升技能栈</h4>
                <div className="flex flex-wrap gap-2">
                  {(analysis.longTermDevelopment.skillStack || []).map(
                    (skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <h4 className="font-medium mb-2">行业经验建议</h4>
                <p>{analysis.longTermDevelopment.industryExperience}</p>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <h4 className="font-medium mb-2">行为面试准备建议</h4>
                <p>{analysis.longTermDevelopment.behavioralPreparation}</p>
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
