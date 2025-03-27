import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiTrendingUp,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiExternalLink,
  FiShare2,
  FiBookmark,
} from "react-icons/fi";
import axios from "axios";

const JobDetail = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [job, setJob] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(!location.state?.job);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!job) {
        try {
          setLoading(true);
          const response = await axios.get(`/api/jobs/${jobId}`);
          setJob(response.data);
          setLoading(false);
        } catch (err) {
          setError("获取职位详情失败，请稍后再试");
          setLoading(false);
        }
      }
    };

    fetchJobDetails();
  }, [jobId, job]);

  // 改进的职位描述格式化函数
  const formatJobDescription = (description) => {
    if (!description) return [];

    let sections = description.split(/\n+/);
    let result = [];
    let currentBulletList = null;

    // 预处理 - 检测哪些行是独立的主标题
    const isTitleLine = new Array(sections.length).fill(false);
    sections.forEach((section, index) => {
      const trimmedSection = section.trim();

      // 检测是否为可能的主标题 - 短行且非冒号结尾
      if (
        trimmedSection &&
        trimmedSection.length < 50 &&
        !trimmedSection.endsWith(":") &&
        !trimmedSection.match(/^[•\-\*\"]/) &&
        index < sections.length - 1
      ) {
        // 下一行不是空行并且不是以特殊字符开头的
        const nextSection = sections[index + 1]?.trim();
        if (
          nextSection &&
          !nextSection.match(/^[A-Z][^a-z]{0,2}[A-Z]/) &&
          nextSection.length > 20
        ) {
          isTitleLine[index] = true;
        }
      }
    });

    sections.forEach((section, index) => {
      const trimmedSection = section.trim();

      // 跳过空行
      if (!trimmedSection) return;

      // 主标题检测 - 通过预处理标记识别
      if (isTitleLine[index]) {
        // 如果有正在构建的列表，先加入结果
        if (currentBulletList) {
          result.push(currentBulletList);
          currentBulletList = null;
        }

        result.push(
          <h3
            key={`title-${index}`}
            className="text-2xl font-extrabold mt-8 mb-5 text-black dark:text-white"
          >
            {trimmedSection}
          </h3>
        );
        return;
      }

      // 处理以点开头的行（保持点符号，但确保左对齐）
      if (trimmedSection.match(/^[•\-\*][\s\t]+/)) {
        // 如果有正在构建的列表，先加入结果
        if (currentBulletList) {
          result.push(currentBulletList);
          currentBulletList = null;
        }

        const textContent = trimmedSection.trim();

        // 检查是否有冒号分隔的键值对
        if (textContent.includes(":")) {
          const parts = textContent.split(":", 2);
          const prefix = parts[0].trim();
          const suffix = parts.length > 1 ? parts[1].trim() : "";

          // 移除前导符号并提取关键词
          const keyText = prefix.replace(/^[•\-\*][\s\t]+/, "");

          result.push(
            <div key={`bullet-item-${index}`} className="mb-3 text-left">
              <div className="flex">
                <span className="text-gray-400 w-4 flex-shrink-0">•</span>
                <div>
                  <span className="font-semibold text-black dark:text-white">
                    {keyText}:
                  </span>
                  {suffix && <span className="ml-1">{suffix}</span>}
                </div>
              </div>
            </div>
          );
        } else {
          // 没有冒号的普通列表项
          const itemText = textContent.replace(/^[•\-\*][\s\t]+/, "");

          result.push(
            <div key={`bullet-simple-${index}`} className="mb-3 text-left">
              <div className="flex">
                <span className="text-gray-400 w-4 flex-shrink-0">•</span>
                <span>{itemText}</span>
              </div>
            </div>
          );
        }
        return;
      }

      // 次要标题识别（首字母大写且以冒号结尾的）
      if (trimmedSection.match(/^[A-Z].*:$/) && trimmedSection.length < 50) {
        // 如果有正在构建的列表，先加入结果
        if (currentBulletList) {
          result.push(currentBulletList);
          currentBulletList = null;
        }

        result.push(
          <h4
            key={`subtitle-${index}`}
            className="text-lg font-semibold mt-6 mb-3 text-black dark:text-white"
          >
            {trimmedSection}
          </h4>
        );
        return;
      }

      // 带内容的次要标题
      if (trimmedSection.match(/^[A-Z].*:/) && trimmedSection.length < 100) {
        // 如果有正在构建的列表，先加入结果
        if (currentBulletList) {
          result.push(currentBulletList);
          currentBulletList = null;
        }

        const [title, content] = trimmedSection.split(":", 2);

        result.push(
          <div key={`subtitle-content-${index}`} className="mb-4">
            <h4 className="text-lg font-semibold text-black dark:text-white inline">
              {title.trim()}:
            </h4>
            {content && <span className="ml-1">{content.trim()}</span>}
          </div>
        );
        return;
      }

      // 如果到这里，说明是普通段落
      if (currentBulletList) {
        result.push(currentBulletList);
        currentBulletList = null;
      }

      result.push(
        <p
          key={`para-${index}`}
          className="mb-4 text-gray-800 dark:text-gray-300 text-left"
        >
          {trimmedSection}
        </p>
      );
    });

    // 如果最后还有未加入的列表
    if (currentBulletList) {
      result.push(currentBulletList);
    }

    return result;
  };

  // 获取发布时间的可读形式
  const getPublishedDate = (dateString) => {
    if (!dateString) return "未知时间";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;

    return date.toLocaleDateString();
  };

  const goBack = () => navigate("/jobs");
  const toggleBookmark = () => setIsBookmarked(!isBookmarked);

  const shareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} - ${job.company}`,
        text: `查看这个职位: ${job.title} at ${job.company}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("链接已复制到剪贴板"))
        .catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <button
          onClick={goBack}
          className="flex items-center text-indigo-600 dark:text-indigo-400 mb-6"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          返回职位列表
        </button>
        <h2 className="text-xl font-semibold mb-2">{error || "未找到职位"}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {error ? error : "该职位可能已被删除或不存在"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex justify-center">
      <main className="p-6 max-w-4xl">
        {/* 导航和操作 */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            返回
          </button>

          <div className="flex space-x-3">
            <button
              onClick={toggleBookmark}
              aria-label={isBookmarked ? "移除收藏" : "收藏职位"}
            >
              <FiBookmark
                className={`h-5 w-5 ${
                  isBookmarked ? "fill-current text-yellow-500" : ""
                }`}
              />
            </button>
            <button onClick={shareJob} aria-label="分享职位">
              <FiShare2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 标题和基本信息 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4 text-left">{job.title}</h1>

          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center">
              <FiBriefcase className="mr-2 h-4 w-4 text-gray-500" />
              <span>{job.company}</span>
            </div>

            <div className="flex items-center">
              <FiMapPin className="mr-2 h-4 w-4 text-gray-500" />
              <span>{job.location}</span>
            </div>

            {job.posted_date && (
              <div className="flex items-center">
                <FiCalendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>发布于 {getPublishedDate(job.posted_date)}</span>
              </div>
            )}

            {job.employment_type && (
              <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800">
                {job.employment_type === "FULL_TIME"
                  ? "全职"
                  : job.employment_type === "PART_TIME"
                  ? "兼职"
                  : job.employment_type === "INTERN"
                  ? "实习"
                  : job.employment_type === "CONTRACTOR"
                  ? "合约"
                  : job.employment_type}
              </div>
            )}
          </div>
        </div>

        {/* AI匹配按钮 */}
        <div className="mb-10">
          <button className="flex items-center justify-center py-2 px-4 rounded-md bg-gradient-to-r from-ai-indigo to-ai-purple text-white hover:shadow-lg transition-shadow">
            <FiTrendingUp className="mr-2 h-4 w-4 animate-pulse-slow" />
            AI 智能匹配分析
          </button>
          <p className="text-xs text-gray-500 mt-2 flex items-center justify-center">
            使用AI分析您的简历与此职位的匹配度
          </p>
        </div>

        {/* 主要信息网格 */}
        <div className="grid grid-cols-2 gap-6 mb-10 text-sm">
          {job.experience && (
            <div>
              <h3 className="text-xs uppercase mb-1 text-gray-500">经验要求</h3>
              <p>{job.experience}</p>
            </div>
          )}

          {job.education && (
            <div>
              <h3 className="text-xs uppercase mb-1 text-gray-500">学历要求</h3>
              <p>{job.education}</p>
            </div>
          )}

          {job.company_size && (
            <div>
              <h3 className="text-xs uppercase mb-1 text-gray-500">公司规模</h3>
              <p>{job.company_size}</p>
            </div>
          )}

          {job.deadline && (
            <div>
              <h3 className="text-xs uppercase mb-1 text-gray-500">截止日期</h3>
              <p>{new Date(job.deadline).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* 职位技能要求 */}
        {job.requirements?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1 h-5 bg-indigo-500 rounded mr-2"></span>
              技能要求
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-full text-sm"
                >
                  <span className="text-indigo-500 mr-1">•</span>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 职位描述 */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <span className="w-1 h-5 bg-indigo-500 rounded mr-2"></span>
            职位描述
          </h2>
          <div className="text-base leading-relaxed">
            {job.description ? (
              formatJobDescription(job.description)
            ) : (
              <p className="text-gray-500">暂无详细描述</p>
            )}
          </div>
        </div>

        {/* 公司信息 - 重新设计 */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <span className="w-1 h-5 bg-indigo-500 rounded mr-2"></span>
            关于公司
          </h2>

          <div className="flex items-start mb-5">
            <div className="h-12 w-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={`${job.company} logo`}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <FiBriefcase className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-black dark:text-white">
                {job.company}
              </h3>
              {job.industry && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {job.industry}
                </p>
              )}
              {job.company_description && (
                <p className="text-gray-800 dark:text-gray-300 text-left">
                  {job.company_description}
                </p>
              )}
            </div>
          </div>

          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <FiExternalLink className="mr-2 h-4 w-4" />
              访问来源网站
            </a>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
