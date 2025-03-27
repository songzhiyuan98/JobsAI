import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiTrendingUp,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiFilter,
  FiX,
  FiArrowRight,
  FiChevronDown,
  FiCheck,
  FiExternalLink,
  FiInfo,
  FiChevronLeft,
} from "react-icons/fi";
import axios from "axios";

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    experience: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("latest");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // 获取职位数据
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/jobs");
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        setError("获取职位数据失败，请稍后再试");
        setLoading(false);
        console.error("获取职位失败:", err);
      }
    };

    fetchJobs();
  }, []);

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("搜索:", searchTerm);
  };

  // 处理过滤器变化
  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
  };

  // 处理排序变化
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // 重置所有过滤器
  const resetFilters = () => {
    setFilters({
      location: "",
      jobType: "",
      experience: "",
    });
    setSearchTerm("");
  };

  // 跳转到职位详情页
  const goToJobDetail = (job) => {
    // 通过react-router导航到详情页，并传递job对象
    navigate(`/job/${job._id || job.id}`, { state: { job } });
  };

  // 打开职位详情
  const openJobDetails = (job) => {
    setSelectedJob(job);
    setShowDrawer(true);
    // 在移动设备上滚动到顶部
    if (window.innerWidth < 768) {
      window.scrollTo(0, 0);
    }
  };

  // 关闭职位详情
  const closeJobDetails = () => {
    setShowDrawer(false);
  };

  // 格式化职位描述文本
  const formatJobDescription = (description) => {
    if (!description) return [];

    // 首先按换行符分割
    let sections = description.split(/\n+/);

    // 处理每个部分
    return sections
      .map((section, index) => {
        // 如果以"• "或"- "或"* "开头，视为列表项
        if (section.trim().match(/^[•\-\*]\s+/)) {
          // 分割成列表项
          const items = section.split(/[•\-\*]\s+/).filter(Boolean);
          return (
            <ul key={index} className="list-disc pl-5 space-y-1 mb-3">
              {items.map((item, idx) => (
                <li key={idx} className="text-gray-600 dark:text-gray-300">
                  {item.trim()}
                </li>
              ))}
            </ul>
          );
        }
        // 如果包含冒号，可能是标题
        else if (section.includes(":") && section.length < 50) {
          const [title, content] = section.split(":", 2);
          return (
            <div key={index} className="mb-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-100">
                {title.trim()}:
              </h4>
              {content && (
                <p className="text-gray-600 dark:text-gray-300">
                  {content.trim()}
                </p>
              )}
            </div>
          );
        }
        // 普通段落
        else if (section.trim()) {
          return (
            <p key={index} className="text-gray-600 dark:text-gray-300 mb-3">
              {section.trim()}
            </p>
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  // 过滤职位
  const filteredJobs = jobs.filter((job) => {
    // 搜索词过滤
    if (
      searchTerm &&
      !job.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !job.company?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // 位置过滤
    if (filters.location && !job.location?.includes(filters.location)) {
      return false;
    }

    // 职位类型过滤
    if (filters.jobType && job.employment_type !== filters.jobType) {
      return false;
    }

    return true;
  });

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 relative">
      {/* 主区域 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题和搜索区域 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            职位列表
          </h1>

          <div className="bg-white dark:bg-gray-800 p-0.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索职位、公司或技能..."
                className="flex-1 py-3 px-4 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white"
              />
              <div className="flex items-center pr-2">
                <button
                  onClick={handleSearch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg"
                >
                  <FiSearch className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和结果区域 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <FiFilter className="h-4 w-4" />
              筛选
              <FiChevronDown
                className={`h-3 w-3 transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className="relative">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="latest">最新发布</option>
                <option value="relevance">相关度</option>
                <option value="salary_high">薪资（高到低）</option>
                <option value="salary_low">薪资（低到高）</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none h-3 w-3" />
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading
              ? "正在加载职位..."
              : `找到 ${filteredJobs.length} 个匹配的职位`}
          </p>
        </div>

        {/* 展开筛选器 */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                筛选条件
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <FiX className="h-3 w-3" />
                重置全部
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  城市
                </label>
                <select
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">所有城市</option>
                  <option value="上海">上海</option>
                  <option value="北京">北京</option>
                  <option value="深圳">深圳</option>
                  <option value="杭州">杭州</option>
                  <option value="广州">广州</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  工作类型
                </label>
                <select
                  value={filters.jobType}
                  onChange={(e) =>
                    handleFilterChange("jobType", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">所有类型</option>
                  <option value="FULLTIME">全职</option>
                  <option value="PARTTIME">兼职</option>
                  <option value="INTERN">实习</option>
                  <option value="CONTRACTOR">合约</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  经验要求
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) =>
                    handleFilterChange("experience", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">所有经验</option>
                  <option value="应届生">应届生</option>
                  <option value="1-3年">1-3年</option>
                  <option value="3-5年">3-5年</option>
                  <option value="5年以上">5年以上</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-xl p-4 mb-6">
            <p className="flex items-center">
              <FiX className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="my-20 flex justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <FiSearch className="h-7 w-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  没有找到匹配的职位
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  尝试调整筛选条件或使用不同的关键词
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  清除筛选条件
                </button>
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <div
                  key={job._id || index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => goToJobDetail(job)}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div className="flex-grow mb-4 sm:mb-0 sm:mr-6">
                        {/* 职位标题和类型 */}
                        <div className="flex items-start gap-2 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h2>

                          {/* 职位类型标签 */}
                          {job.employment_type && (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 mt-1.5">
                              {job.employment_type === "FULLTIME"
                                ? "全职"
                                : job.employment_type === "PARTTIME"
                                ? "兼职"
                                : job.employment_type === "INTERN"
                                ? "实习"
                                : job.employment_type === "CONTRACTOR"
                                ? "合约"
                                : job.employment_type}
                            </span>
                          )}
                        </div>

                        {/* 公司和位置 */}
                        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                          <span className="text-gray-900 dark:text-gray-200 font-medium">
                            {job.company}
                          </span>
                          <span className="mx-2">·</span>
                          <span className="flex items-center">
                            <FiMapPin className="mr-1 h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          {job.posted_date && (
                            <>
                              <span className="mx-2">·</span>
                              <span className="flex items-center">
                                <FiCalendar className="mr-1 h-3.5 w-3.5" />
                                {getPublishedDate(job.posted_date)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* 技能标签 */}
                        {job.requirements?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.requirements.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.requirements.length > 4 && (
                              <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                +{job.requirements.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 薪资和行动按钮 */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-0">
                        {(job.salary_min || job.salary_max) && (
                          <div className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap sm:mb-3">
                            {job.salary_min && job.salary_max
                              ? `${job.salary_min}-${job.salary_max}${
                                  job.salary_currency || ""
                                }`
                              : job.salary_min
                              ? `${job.salary_min}${job.salary_currency || ""}+`
                              : `${job.salary_max}${job.salary_currency || ""}`}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                        >
                          <FiTrendingUp className="mr-1.5 h-4 w-4" />
                          AI匹配分析
                        </button>
                      </div>
                    </div>

                    {/* 部分描述预览 */}
                    {job.description && (
                      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {job.description.substring(0, 150)}
                        {job.description.length > 150 && "..."}
                      </div>
                    )}

                    {/* 底部操作 */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                      <div className="group/btn inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        查看详情
                        <FiArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 分页 */}
        {!loading && filteredJobs.length > 0 && (
          <div className="mt-10 flex justify-center">
            <nav className="inline-flex rounded-xl overflow-hidden shadow-sm isolate">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                上一页
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 bg-indigo-600 text-sm font-medium text-white">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                2
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                3
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                下一页
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* 侧边抽屉 - 职位详情 */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedJob && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* 抽屉头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={closeJobDetails}
                className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="font-medium text-gray-900 dark:text-white truncate">
                职位详情
              </h2>
              <button
                onClick={closeJobDetails}
                className="p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* 职位标题和标签 */}
              <div className="flex flex-wrap items-start gap-2 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                  {selectedJob.title}
                </h1>
                {selectedJob.employment_type && (
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 mt-2">
                    {selectedJob.employment_type === "FULLTIME"
                      ? "全职"
                      : selectedJob.employment_type === "PARTTIME"
                      ? "兼职"
                      : selectedJob.employment_type === "INTERN"
                      ? "实习"
                      : selectedJob.employment_type === "CONTRACTOR"
                      ? "合约"
                      : selectedJob.employment_type}
                  </span>
                )}
              </div>

              {/* 公司信息卡片 */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                    <FiBriefcase className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedJob.company}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <FiMapPin className="mr-1 h-3.5 w-3.5" />
                      {selectedJob.location}
                      {selectedJob.posted_date && (
                        <>
                          <span className="mx-2">·</span>
                          <FiCalendar className="mr-1 h-3.5 w-3.5" />
                          {getPublishedDate(selectedJob.posted_date)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 薪资信息 */}
              {(selectedJob.salary_min || selectedJob.salary_max) && (
                <div className="mb-6 p-4 border border-green-100 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    薪资范围
                  </h3>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {selectedJob.salary_min && selectedJob.salary_max
                      ? `${selectedJob.salary_min}-${selectedJob.salary_max}${
                          selectedJob.salary_currency || ""
                        }`
                      : selectedJob.salary_min
                      ? `${selectedJob.salary_min}${
                          selectedJob.salary_currency || ""
                        }+`
                      : `${selectedJob.salary_max}${
                          selectedJob.salary_currency || ""
                        }`}
                  </p>
                </div>
              )}

              {/* 职位描述 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  职位描述
                </h3>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  {selectedJob.description ? (
                    formatJobDescription(selectedJob.description)
                  ) : (
                    <p>暂无详细描述</p>
                  )}
                </div>
              </div>

              {/* 技能要求 */}
              {selectedJob.requirements?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    技能要求
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requirements.map((skill, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg flex items-center"
                      >
                        <FiCheck className="mr-1.5 h-4 w-4" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 其他信息 */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden mb-8">
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    经验要求
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedJob.experience || "未指定"}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    学历要求
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedJob.education || "不限"}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    职位编号
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedJob.job_id || selectedJob._id || "未提供"}
                  </span>
                </div>
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-3">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center transition-colors">
                  <FiTrendingUp className="mr-2 h-4 w-4" />
                  AI 匹配分析
                </button>
                <button className="flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center transition-colors">
                  <FiExternalLink className="mr-2 h-4 w-4" />
                  查看原始链接
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 半透明背景遮罩 */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity"
          onClick={closeJobDetails}
        ></div>
      )}
    </div>
  );
};

export default JobList;
