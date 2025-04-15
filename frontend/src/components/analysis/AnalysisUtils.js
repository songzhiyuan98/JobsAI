import html2pdf from "html2pdf.js";

// 下载PDF报告
export const downloadPDF = (analysis) => {
  console.log("下载PDF", analysis);
  alert("PDF下载功能正在开发中");
};

// 打印报告
export const printReport = () => {
  window.print();
};

// 分享报告
export const shareReport = (analysis) => {
  console.log("分享报告", analysis);
  // 如果支持Web Share API
  if (navigator.share) {
    navigator.share({
      title: "简历分析结果",
      text: `简历与职位匹配度分析 - 匹配得分: ${analysis.matchScore}%`,
      url: window.location.href,
    });
  } else {
    alert("分享功能正在开发中");
  }
};

/**
 * 格式化日期
 * @param {Date|string} date 日期对象或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
