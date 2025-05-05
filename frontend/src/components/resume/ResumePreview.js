import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiArrowLeft,
  FiFileText,
  FiEdit,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLink,
} from "react-icons/fi";

const ResumePreview = ({ resumeId, onClose, onEdit }) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResumeDetails();
  }, [resumeId]);

  const fetchResumeDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResume(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("获取简历详情失败:", err);
      setError("无法加载简历信息");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            简历预览
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300">
          {error || "无法加载简历信息"}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <FiArrowLeft className="inline mr-2" /> 返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-5xl mx-auto">
      {/* 头部 */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <FiFileText className="text-indigo-500 dark:text-indigo-400 mr-2 text-xl" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            简历预览
          </h2>
          {resume.isVerified ? (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
              <FiCheckCircle className="mr-1" /> 已验证
            </span>
          ) : (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
              <FiAlertCircle className="mr-1" /> 待验证
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg flex items-center text-sm"
          >
            <FiEdit className="mr-1.5" /> 编辑简历
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* 内容 - 使用半透明背景和左对齐文本 */}
      <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-left">
        {/* 基本信息 - 更紧凑的设计 */}
        <div className="mb-6 text-left border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {resume.basicInfo.fullName || "姓名未提供"}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 dark:text-gray-300">
            {resume.basicInfo.email && (
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-1.5">
                  <FiMail className="text-blue-500 dark:text-blue-400 text-xs" />
                </div>
                <span className="text-xs">{resume.basicInfo.email}</span>
              </div>
            )}

            {resume.basicInfo.phone && (
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mr-1.5">
                  <FiPhone className="text-green-500 dark:text-green-400 text-xs" />
                </div>
                <span className="text-xs">{resume.basicInfo.phone}</span>
              </div>
            )}

            {resume.basicInfo.location && (
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mr-1.5">
                  <FiMapPin className="text-amber-500 dark:text-amber-400 text-xs" />
                </div>
                <span className="text-xs">{resume.basicInfo.location}</span>
              </div>
            )}
          </div>

          {resume.basicInfo.links && resume.basicInfo.links.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {resume.basicInfo.links.map((link, index) => (
                <a
                  key={index}
                  href={typeof link === "string" ? link : link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs"
                >
                  <FiLink className="mr-1 text-xs" />
                  {typeof link === "string"
                    ? link.replace(/^https?:\/\//, "")
                    : link.type || link.url.replace(/^https?:\/\//, "")}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 教育经历 */}
        {resume.education && resume.education.length > 0 && (
          <div className="mb-8 text-left">
            <h4 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">
              教育经历
            </h4>
            <div className="space-y-5">
              {resume.education.map((edu, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800"
                >
                  <div className="font-medium text-lg text-gray-900 dark:text-white">
                    {edu.institution}
                    {edu.degree && ` - ${edu.degree}`}
                  </div>
                  {edu.major && (
                    <div className="text-gray-700 dark:text-gray-300">
                      {edu.major}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between mt-1">
                    <span>
                      {edu.startDate && new Date(edu.startDate).getFullYear()}
                      {edu.endDate &&
                        ` - ${new Date(edu.endDate).getFullYear()}`}
                    </span>
                    {edu.gpa > 0 && <span>GPA: {edu.gpa}</span>}
                  </div>
                  {edu.courses && edu.courses.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">相关课程: </span>
                      {edu.courses.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 工作经验 */}
        {resume.experience && resume.experience.length > 0 && (
          <div className="mb-8 text-left">
            <h4 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">
              工作经验
            </h4>
            <div className="space-y-5">
              {resume.experience.map((exp, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-green-200 dark:border-green-800"
                >
                  <div className="font-medium text-lg text-gray-900 dark:text-white">
                    {exp.company}
                    {exp.position && ` - ${exp.position}`}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between mt-1">
                    <span>
                      {exp.startDate && new Date(exp.startDate).getFullYear()}
                      {exp.current
                        ? " - 至今"
                        : exp.endDate &&
                          ` - ${new Date(exp.endDate).getFullYear()}`}
                    </span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  {exp.descriptions && exp.descriptions.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                      {exp.descriptions.map((desc, i) => (
                        <li key={i} className="mt-1">
                          {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 项目经验 */}
        {resume.projects && resume.projects.length > 0 && (
          <div className="mb-8 text-left">
            <h4 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">
              项目经验
            </h4>
            <div className="space-y-5">
              {resume.projects.map((project, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-blue-200 dark:border-blue-800"
                >
                  <div className="font-medium text-lg text-gray-900 dark:text-white">
                    {project.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {project.startDate &&
                      new Date(project.startDate).getFullYear()}
                    {project.endDate &&
                      ` - ${new Date(project.endDate).getFullYear()}`}
                  </div>
                  {project.descriptions && project.descriptions.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                      {project.descriptions.map((desc, i) => (
                        <li key={i} className="mt-1">
                          {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                  {project.links && project.links.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        链接:{" "}
                      </span>
                      {project.links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline mr-3"
                        >
                          {link.replace(/^https?:\/\//, "")}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 技能 */}
        {resume.skills && resume.skills.length > 0 && (
          <div className="mb-8 text-left">
            <h4 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">
              技能
            </h4>
            <div className="space-y-4">
              {resume.skills.map((skillGroup, index) => (
                <div key={index} className="pl-0">
                  {skillGroup.category && (
                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {skillGroup.category}:
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-block px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 荣誉奖项 */}
        {resume.honors && resume.honors.length > 0 && (
          <div className="mb-6 text-left">
            <h4 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">
              荣誉奖项
            </h4>
            <div className="space-y-3">
              {resume.honors.map((honor, index) => (
                <div
                  key={index}
                  className="pl-4 border-l-2 border-amber-200 dark:border-amber-800"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {honor.title}
                  </div>
                  {honor.date && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(honor.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <button
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition"
        >
          <FiArrowLeft className="inline mr-2" /> 返回
        </button>

        {!resume.isVerified && (
          <button
            onClick={onEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiEdit className="inline mr-2" /> 验证简历
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
