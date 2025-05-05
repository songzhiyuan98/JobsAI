import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiMapPin,
  FiCode,
  FiFileText,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";

const OverviewSection = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveResume();
  }, []);

  const fetchActiveResume = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/resumes/active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumeData(response.data.data);
    } catch (err) {
      setError("获取简历信息失败");
      console.error("获取简历信息错误:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-800 dark:text-red-300">
        <div className="flex">
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* 简历信息卡片 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                个人资料
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                资料来源于简历分析，请及时更新
              </p>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  基本信息
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    姓名
                  </div>
                  <div className="text-base text-gray-900 dark:text-white mt-1">
                    {resumeData?.basicInfo?.fullName || "未设置"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    邮箱
                  </div>
                  <div className="text-base text-gray-900 dark:text-white mt-1">
                    {resumeData?.basicInfo?.email || "未设置"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    电话
                  </div>
                  <div className="text-base text-gray-900 dark:text-white mt-1">
                    {resumeData?.basicInfo?.phone || "未设置"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    位置
                  </div>
                  <div className="text-base text-gray-900 dark:text-white mt-1">
                    {resumeData?.basicInfo?.location || "未设置"}
                  </div>
                </div>
              </div>
            </div>

            {/* 教育经历 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiBriefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  教育经历
                </h3>
              </div>
              <div className="space-y-3">
                {resumeData?.education?.map((edu, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {edu.institution}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {edu.degree} in {edu.major}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      GPA: {edu.gpa}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(edu.startDate).getFullYear()} -{" "}
                      {edu.endDate
                        ? new Date(edu.endDate).getFullYear()
                        : "至今"}
                    </div>
                  </div>
                )) || (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    未设置教育经历
                  </span>
                )}
              </div>
            </div>

            {/* 工作经验 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiBriefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  工作经验
                </h3>
              </div>
              <div className="space-y-3">
                {resumeData?.experience?.map((exp, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {exp.position}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {exp.company} - {exp.location}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(exp.startDate).getFullYear()} -{" "}
                      {exp.current
                        ? "至今"
                        : new Date(exp.endDate).getFullYear()}
                    </div>
                  </div>
                )) || (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    未设置工作经验
                  </span>
                )}
              </div>
            </div>

            {/* 项目经验 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  项目经验
                </h3>
              </div>
              <div className="space-y-3">
                {resumeData?.projects?.map((project, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {project.instruction}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(project.startDate).getFullYear()} -{" "}
                      {project.endDate
                        ? new Date(project.endDate).getFullYear()
                        : "至今"}
                    </div>
                  </div>
                )) || (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    未设置项目经验
                  </span>
                )}
              </div>
            </div>

            {/* 技能标签 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  技能标签
                </h3>
              </div>
              <div className="space-y-3">
                {resumeData?.skills?.map((skillGroup, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {skillGroup.category}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items?.map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )) || (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    未设置技能
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
