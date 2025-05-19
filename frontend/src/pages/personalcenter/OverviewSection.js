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
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";

const API_URL = process.env.REACT_APP_API_URL;

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
      const response = await axios.get(`${API_URL}/api/resumes/active`, {
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
      <div className="min-h-[50vh] flex justify-center items-center p-8">
        <div className="text-center">
          <FiLoader className="animate-spin text-indigo-600 h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            正在加载您的个人信息...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-5 mb-3">
            <FiAlertTriangle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            未找到激活的简历
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
            请先验证并激活一份简历，以启用个人信息显示功能
          </p>
          <div className="space-x-4">
            <a
              href="/resume"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              去验证简历
            </a>
            <a
              href="/resume/upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              上传新简历
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            个人资料
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            资料来源于简历分析，请及时更新
          </p>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
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
