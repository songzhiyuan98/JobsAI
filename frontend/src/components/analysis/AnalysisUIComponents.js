import React from "react";
import {
  FiDownload,
  FiShare2,
  FiPrinter,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiMessageSquare,
  FiBarChart2,
  FiAward,
  FiTool,
  FiBriefcase,
  FiFileText,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { formatDate } from "./AnalysisUtils";

// 加载状态组件
export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <FiLoader className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
      加载分析报告中...
    </h2>
  </div>
);

// 错误状态组件
export const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg mb-4 flex items-start">
      <FiAlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold mb-1">获取分析报告失败</h3>
        <p>{message}</p>
      </div>
    </div>
    <button
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
    >
      重试
    </button>
  </div>
);

// 分析报告头部
export const AnalysisHeader = ({ analysis }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
    <div className="flex flex-col md:flex-row md:items-center">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          总体匹配度
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          您的简历与{analysis.job?.title || "目标职位"}的总体匹配情况
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl py-3 px-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {analysis.matchScore || 0}%
            </span>
            <span className="ml-2 text-indigo-600 dark:text-indigo-400">
              匹配度
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 操作栏
export const AnalysisActionBar = ({ onDownload, onPrint, onShare }) => (
  <div id="analysis-action-bar" className="flex justify-end space-x-3 mb-6">
    <button
      onClick={onDownload}
      className="flex items-center px-3 py-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/30"
    >
      <FiDownload className="mr-1" /> 下载PDF
    </button>
    <button
      onClick={onPrint}
      className="flex items-center px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/30"
    >
      <FiPrinter className="mr-1" /> 打印
    </button>
    <button
      onClick={onShare}
      className="flex items-center px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30"
    >
      <FiShare2 className="mr-1" /> 分享
    </button>
  </div>
);

// 标签选项卡
export const AnalysisTabs = ({ activeTab, onTabChange }) => (
  <div
    id="analysis-tab-bar"
    className="border-b border-gray-200 dark:border-gray-700 mb-6"
  >
    <div className="flex space-x-4">
      <button
        onClick={() => onTabChange("summary")}
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === "summary"
            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        总览
      </button>
      <button
        onClick={() => onTabChange("skills")}
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === "skills"
            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        技能分析
      </button>
      <button
        onClick={() => onTabChange("history")}
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === "history"
            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        历史比较
      </button>
    </div>
  </div>
);

// 总览标签页内容
export const SummaryTab = ({
  analysis,
  expandedSections,
  toggleSection,
  chartRefs,
}) => (
  <div>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        匹配总览
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        分析您的简历与{analysis.job?.title || "目标职位"}
        的匹配情况，包括技能、经验和教育背景等方面。
      </p>
    </div>

    {/* 评分卡部分 */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <ScoreCard
        title="技能匹配"
        score={analysis.skillMatchScore || 0}
        icon={<FiAward />}
        color="indigo"
      />
      <ScoreCard
        title="经验匹配"
        score={analysis.experienceMatchScore || 0}
        icon={<FiBriefcase />}
        color="green"
      />
      <ScoreCard
        title="教育匹配"
        score={analysis.educationMatchScore || 0}
        icon={<FiFileText />}
        color="purple"
      />
      <ScoreCard
        title="ATS通过率"
        score={analysis.atsPassProbability || 0}
        icon={<FiCheckCircle />}
        color="amber"
      />
    </div>

    {/* 整体匹配分析 */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        整体匹配分析
      </h2>

      <div className="space-y-4">
        <ProgressBar
          label="技能匹配"
          value={analysis.skillMatchScore || 0}
          color="indigo"
        />
        <ProgressBar
          label="经验匹配"
          value={analysis.experienceMatchScore || 0}
          color="green"
        />
        <ProgressBar
          label="教育匹配"
          value={analysis.educationMatchScore || 0}
          color="purple"
        />
      </div>
    </div>

    {/* 匹配度分布图 */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        匹配度分布
      </h2>
      <div ref={chartRefs.matchDistribution} className="h-64 w-full"></div>
    </div>

    {/* 优势和劣势部分 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <CollapsibleSection
        title="优势分析"
        isExpanded={expandedSections.strengths}
        toggle={() => toggleSection("strengths")}
        icon={<FiCheckCircle className="text-green-500" />}
        items={
          analysis.strengths || [
            "拥有该职位所需的核心技术技能",
            "具备相关行业经验",
            "有处理类似项目的记录",
            "教育背景符合要求",
          ]
        }
        itemIconClass="text-green-500"
        ItemIcon={FiCheckCircle}
      />

      <CollapsibleSection
        title="改进空间"
        isExpanded={expandedSections.weaknesses}
        toggle={() => toggleSection("weaknesses")}
        icon={<FiXCircle className="text-red-500" />}
        items={
          analysis.weaknesses || [
            "缺乏某些职位要求的高级技术技能",
            "行业经验相对较少",
            "管理经验不足",
            "某些特定领域知识需要加强",
          ]
        }
        itemIconClass="text-red-500"
        ItemIcon={FiXCircle}
      />
    </div>
  </div>
);

// 技能分析标签页
export const SkillsTab = ({
  analysis,
  expandedSections,
  toggleSection,
  chartRefs,
}) => (
  <div>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        技能分析
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        详细分析您的技能与{analysis.job?.title || "目标职位"}要求的匹配程度。
      </p>
    </div>

    {/* 技能雷达图 */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        技能匹配雷达图
      </h2>
      <div ref={chartRefs.radarChart} className="h-80 w-full"></div>
    </div>

    {/* 技能匹配详情 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <CollapsibleSection
        title="技术技能"
        isExpanded={expandedSections.technicalSkills}
        toggle={() => toggleSection("technicalSkills")}
        icon={<FiTool className="text-indigo-500" />}
        content={
          <div className="mt-2">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    技能
                  </th>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    职位要求
                  </th>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    您的水平
                  </th>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    匹配度
                  </th>
                </tr>
              </thead>
              <tbody>
                {(
                  analysis.technicalSkills || [
                    {
                      name: "JavaScript",
                      required: "高级",
                      level: "高级",
                      match: "高",
                    },
                    {
                      name: "React",
                      required: "中级",
                      level: "高级",
                      match: "高",
                    },
                    {
                      name: "Node.js",
                      required: "中级",
                      level: "中级",
                      match: "中",
                    },
                    {
                      name: "SQL",
                      required: "初级",
                      level: "中级",
                      match: "高",
                    },
                  ]
                ).map((skill, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? "bg-gray-50 dark:bg-gray-700/30" : ""
                    }
                  >
                    <td className="py-2 text-gray-800 dark:text-gray-300">
                      {skill.name}
                    </td>
                    <td className="py-2 text-gray-800 dark:text-gray-300">
                      {skill.required}
                    </td>
                    <td className="py-2 text-gray-800 dark:text-gray-300">
                      {skill.level}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          skill.match === "高"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : skill.match === "中"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {skill.match}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />

      <CollapsibleSection
        title="软技能"
        isExpanded={expandedSections.softSkills}
        toggle={() => toggleSection("softSkills")}
        icon={<FiUser className="text-purple-500" />}
        content={
          <div className="mt-2">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    技能
                  </th>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    职位要求
                  </th>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    您的水平
                  </th>
                  <th className="text-left pb-2 text-gray-600 dark:text-gray-400">
                    匹配度
                  </th>
                </tr>
              </thead>
              <tbody>
                {(
                  analysis.softSkills || [
                    {
                      name: "团队协作",
                      required: "高级",
                      level: "高级",
                      match: "高",
                    },
                    {
                      name: "沟通能力",
                      required: "高级",
                      level: "中级",
                      match: "中",
                    },
                    {
                      name: "问题解决",
                      required: "中级",
                      level: "高级",
                      match: "高",
                    },
                    {
                      name: "时间管理",
                      required: "中级",
                      level: "中级",
                      match: "中",
                    },
                  ]
                ).map((skill, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? "bg-gray-50 dark:bg-gray-700/30" : ""
                    }
                  >
                    <td className="py-2 text-gray-800 dark:text-gray-300">
                      {skill.name}
                    </td>
                    <td className="py-2 text-gray-800 dark:text-gray-300">
                      {skill.required}
                    </td>
                    <td className="py-2 text-gray-800 dark:text-gray-300">
                      {skill.level}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          skill.match === "高"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : skill.match === "中"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {skill.match}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </div>

    {/* 技能比较图 */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        关键技能比较
      </h2>
      <div ref={chartRefs.skillComparison} className="h-80 w-full"></div>
    </div>

    {/* 技能提升建议 */}
    <CollapsibleSection
      title="技能提升建议"
      isExpanded={expandedSections.suggestions}
      toggle={() => toggleSection("suggestions")}
      icon={<FiMessageSquare className="text-blue-500" />}
      content={
        <div className="mt-4 space-y-4">
          {(
            analysis.skillSuggestions || [
              "提高 Node.js 的后端开发经验，尝试构建完整的 RESTful API",
              "加强云服务经验，特别是 AWS 或 Azure 相关的部署和管理",
              "通过实际项目提升数据库设计和查询优化能力",
              "参与更多团队协作项目，提高沟通和协作技能",
            ]
          ).map((suggestion, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30"
            >
              <div className="flex items-start">
                <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      }
    />
  </div>
);

// 历史比较标签页
export const HistoryTab = ({ analysis, chartRefs }) => {
  const historyData = analysis.resumeHistory || [
    { date: "2023-06-15", score: 65, changes: "初始版本", version: "1.0" },
    {
      date: "2023-06-28",
      score: 72,
      changes: "更新技能和项目描述",
      version: "1.1",
    },
    {
      date: "2023-07-10",
      score: 78,
      changes: "根据职位要求调整工作经历",
      version: "1.2",
    },
    {
      date: "2023-07-25",
      score: 82,
      changes: "添加关键成就和量化指标",
      version: "当前",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          历史数据分析
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          查看您的简历版本历史和匹配度变化趋势。
        </p>
      </div>

      {/* 历史分数图表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          匹配度历史变化
        </h2>
        <div ref={chartRefs.scoreHistory} className="h-80 w-full"></div>
      </div>

      {/* 历史版本比较表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <FiBarChart2 className="inline-block mr-2 text-indigo-500" />{" "}
          简历版本历史
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  日期
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  匹配度
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  更改概述
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  版本
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {historyData.map((item, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "bg-gray-50 dark:bg-gray-750" : ""
                  }
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.score}%
                      </span>
                      {index > 0 && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                          +{item.score - historyData[index - 1].score}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {item.changes}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.version === "当前"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-750 text-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {item.version}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
          <h3 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center">
            <FiCheckCircle className="mr-2" /> 改进进展分析
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            您的简历匹配度从初始版本的{historyData[0]?.score || 0}
            %提升到了当前的{historyData[historyData.length - 1]?.score || 0}%，
            显著提高了
            {(historyData[historyData.length - 1]?.score || 0) -
              (historyData[0]?.score || 0)}
            个百分点。
            技能匹配度和ATS通过率也有显著提升，表明您的简历针对此职位的优化非常有效。
          </p>
        </div>
      </div>
    </div>
  );
};

// 评分卡组件
export const ScoreCard = ({ title, score, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
      {title}
    </div>
    <div className="flex items-center">
      <div
        className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}
      >
        {score}%
      </div>
      <div
        className={`ml-auto w-12 h-12 flex items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900/30`}
      >
        <div className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

// 进度条组件
export const ProgressBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <span
        className={`text-sm font-medium text-${color}-600 dark:text-${color}-400`}
      >
        {value}%
      </span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div
        className={`bg-${color}-600 dark:bg-${color}-500 h-2.5 rounded-full`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

// 可折叠部分组件 (包含内容属性版本)
export const CollapsibleSection = ({
  title,
  isExpanded,
  toggle,
  icon,
  content,
  items,
  itemIconClass,
  ItemIcon,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
    <div
      className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer"
      onClick={toggle}
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
        {icon} <span className="ml-2">{title}</span>
      </h2>
      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
    </div>

    {isExpanded && (
      <div className="p-6">
        {content ? (
          content
        ) : items ? (
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="flex items-start">
                {ItemIcon && (
                  <ItemIcon
                    className={`${itemIconClass} mt-1 mr-3 flex-shrink-0`}
                  />
                )}
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )}
  </div>
);
