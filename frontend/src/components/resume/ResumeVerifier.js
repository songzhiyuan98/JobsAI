import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiEdit,
  FiSave,
  FiPlus,
  FiMinus,
  FiRefreshCw,
  FiTrash,
  FiX,
  FiCalendar,
  FiUser,
  FiBook,
  FiBriefcase,
  FiCode,
  FiTool,
  FiAward,
  FiFileText,
  FiType,
} from "react-icons/fi";
import axios from "axios";

const ResumeVerifier = ({ resumeId, onClose, onSuccess }) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModeFields, setEditModeFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basicInfo");

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
      setError("获取简历详情失败");
      setLoading(false);
      console.error("获取简历详情错误:", err);
    }
  };

  const toggleEditMode = (field) => {
    setEditModeFields({
      ...editModeFields,
      [field]: !editModeFields[field],
    });
  };

  // 更新简单字段
  const updateField = (field, value) => {
    setResume({
      ...resume,
      [field]: value,
    });
  };

  // 更新基本信息
  const updateBasicInfoField = (field, value) => {
    setResume({
      ...resume,
      basicInfo: {
        ...resume.basicInfo,
        [field]: value,
      },
    });
  };

  // 更新嵌套字段
  const updateNestedField = (section, index, field, value) => {
    const updatedSection = [...resume[section]];
    updatedSection[index] = {
      ...updatedSection[index],
      [field]: value,
    };

    setResume({
      ...resume,
      [section]: updatedSection,
    });
  };

  // 添加新条目
  const addItemToSection = (section, defaultItem) => {
    setResume({
      ...resume,
      [section]: [...resume[section], defaultItem],
    });
  };

  // 删除条目
  const removeItemFromSection = (section, index) => {
    if (window.confirm("确定要删除这条记录吗？")) {
      setResume({
        ...resume,
        [section]: resume[section].filter((_, i) => i !== index),
      });
    }
  };

  // 保存简历
  const saveResume = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // 保存更新
      await axios.put(`/api/resumes/${resumeId}`, resume, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSaving(false);
      onSuccess && onSuccess(resume);
    } catch (err) {
      setSaving(false);
      setError("保存简历失败");
      console.error("保存简历错误:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FiRefreshCw className="animate-spin text-indigo-600 h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchResumeDetails}
          className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
        >
          <FiRefreshCw className="inline-block mr-1" /> 重试
        </button>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <p className="text-yellow-600 dark:text-yellow-400">无法加载简历数据</p>
      </div>
    );
  }

  const tabs = [
    { id: "name", label: "简历名称", icon: <FiType className="mr-2" /> },
    { id: "basicInfo", label: "基本信息", icon: <FiUser className="mr-2" /> },
    { id: "education", label: "教育经历", icon: <FiBook className="mr-2" /> },
    {
      id: "experience",
      label: "工作经验",
      icon: <FiBriefcase className="mr-2" />,
    },
    { id: "projects", label: "项目经历", icon: <FiCode className="mr-2" /> },
    { id: "skills", label: "技能", icon: <FiTool className="mr-2" /> },
    { id: "honors", label: "荣誉", icon: <FiAward className="mr-2" /> },
  ];

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto border border-gray-200/50 dark:border-gray-700/50">
      <div className="p-6 border-b border-gray-200/70 dark:border-gray-700/70 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <FiFileText className="mr-2" /> 编辑简历: {resume.name}
        </h2>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200/70 dark:bg-gray-700/70 rounded-md hover:bg-gray-300/70 dark:hover:bg-gray-600/70 transition-colors"
          >
            <FiX className="inline-block mr-1" /> 返回
          </button>
          <button
            onClick={saveResume}
            disabled={saving}
            className={`px-4 py-2 text-white bg-indigo-600/90 dark:bg-indigo-600/80 rounded-md hover:bg-indigo-700/90 dark:hover:bg-indigo-700/80 transition-colors ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? (
              <>
                <FiRefreshCw className="inline-block mr-1 animate-spin" />{" "}
                保存中
              </>
            ) : (
              <>
                <FiSave className="inline-block mr-1" /> 保存
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* 侧边导航 */}
        <div className="w-full md:w-64 bg-gray-50/70 dark:bg-gray-900/50 backdrop-blur-sm p-4">
          <nav>
            <ul>
              {tabs.map((tab) => (
                <li key={tab.id} className="mb-1">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                      activeTab === tab.id
                        ? "bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800/60"
                    } transition-colors`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-auto max-h-[calc(100vh-12rem)]">
          {/* 新增: 简历名称编辑部分 */}
          {activeTab === "name" && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  简历名称
                </h3>
                <button
                  onClick={() => toggleEditMode("resumeName")}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  {editModeFields["resumeName"] ? (
                    <>
                      <FiSave className="inline-block mr-1" /> 保存
                    </>
                  ) : (
                    <>
                      <FiEdit className="inline-block mr-1" /> 编辑
                    </>
                  )}
                </button>
              </div>

              {editModeFields["resumeName"] ? (
                <div className="bg-gray-50/70 dark:bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      简历名称
                    </label>
                    <input
                      type="text"
                      value={resume.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full p-2 border border-gray-300/80 dark:border-gray-600/80 rounded-md bg-white/70 dark:bg-gray-800/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="给您的简历起个名字"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/70 dark:bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg">
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      名称：
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {resume.name || "未命名简历"}
                    </span>
                  </p>
                </div>
              )}
            </section>
          )}

          {activeTab === "basicInfo" && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  基本信息
                </h3>
                <button
                  onClick={() => toggleEditMode("basicInfo")}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  {editModeFields["basicInfo"] ? (
                    <>
                      <FiSave className="inline-block mr-1" /> 保存
                    </>
                  ) : (
                    <>
                      <FiEdit className="inline-block mr-1" /> 编辑
                    </>
                  )}
                </button>
              </div>

              {editModeFields["basicInfo"] ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 dark:bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      姓名
                    </label>
                    <input
                      type="text"
                      value={resume.basicInfo?.fullName || ""}
                      onChange={(e) =>
                        updateBasicInfoField("fullName", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300/80 dark:border-gray-600/80 rounded-md bg-white/70 dark:bg-gray-800/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={resume.basicInfo?.email || ""}
                      onChange={(e) =>
                        updateBasicInfoField("email", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300/80 dark:border-gray-600/80 rounded-md bg-white/70 dark:bg-gray-800/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      电话
                    </label>
                    <input
                      type="tel"
                      value={resume.basicInfo?.phone || ""}
                      onChange={(e) =>
                        updateBasicInfoField("phone", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300/80 dark:border-gray-600/80 rounded-md bg-white/70 dark:bg-gray-800/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      地点
                    </label>
                    <input
                      type="text"
                      value={resume.basicInfo?.location || ""}
                      onChange={(e) =>
                        updateBasicInfoField("location", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300/80 dark:border-gray-600/80 rounded-md bg-white/70 dark:bg-gray-800/70"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/70 dark:bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg">
                  <p className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      姓名：
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {resume.basicInfo?.fullName || "未填写"}
                    </span>
                  </p>
                  <p className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      邮箱：
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {resume.basicInfo?.email || "未填写"}
                    </span>
                  </p>
                  <p className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      电话：
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {resume.basicInfo?.phone || "未填写"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      地点：
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {resume.basicInfo?.location || "未填写"}
                    </span>
                  </p>
                </div>
              )}
            </section>
          )}

          {activeTab === "education" && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  教育经历
                </h3>
                <button
                  onClick={() =>
                    addItemToSection("education", {
                      institution: "",
                      degree: "",
                      major: "",
                      startDate: "",
                      endDate: "",
                      courses: [],
                    })
                  }
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <FiPlus className="inline-block mr-1" /> 添加教育经历
                </button>
              </div>

              {resume.education.length === 0 ? (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  暂无教育经历信息
                </p>
              ) : (
                <div className="space-y-4">
                  {resume.education.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      {editModeFields[`education-${index}`] ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                学校
                              </label>
                              <input
                                type="text"
                                value={edu.institution || ""}
                                onChange={(e) =>
                                  updateNestedField(
                                    "education",
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                学位
                              </label>
                              <input
                                type="text"
                                value={edu.degree || ""}
                                onChange={(e) =>
                                  updateNestedField(
                                    "education",
                                    index,
                                    "degree",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                专业
                              </label>
                              <input
                                type="text"
                                value={edu.major || ""}
                                onChange={(e) =>
                                  updateNestedField(
                                    "education",
                                    index,
                                    "major",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                GPA
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="4.0"
                                value={edu.gpa || ""}
                                onChange={(e) =>
                                  updateNestedField(
                                    "education",
                                    index,
                                    "gpa",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                开始日期
                              </label>
                              <input
                                type="date"
                                value={
                                  edu.startDate
                                    ? new Date(edu.startDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  updateNestedField(
                                    "education",
                                    index,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                结束日期
                              </label>
                              <input
                                type="date"
                                value={
                                  edu.endDate
                                    ? new Date(edu.endDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  updateNestedField(
                                    "education",
                                    index,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              相关课程 (用逗号分隔)
                            </label>
                            <input
                              type="text"
                              value={(edu.courses || []).join(", ")}
                              onChange={(e) =>
                                updateNestedField(
                                  "education",
                                  index,
                                  "courses",
                                  e.target.value
                                    .split(",")
                                    .map((item) => item.trim())
                                )
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() =>
                                toggleEditMode(`education-${index}`)
                              }
                              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200"
                            >
                              <FiSave className="inline-block mr-1" />
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {edu.institution || "未指定学校"}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {edu.degree} {edu.major ? `- ${edu.major}` : ""}
                              {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                              {edu.startDate
                                ? new Date(edu.startDate).toLocaleDateString()
                                : "?"}{" "}
                              -
                              {edu.endDate
                                ? new Date(edu.endDate).toLocaleDateString()
                                : "至今"}
                            </p>
                            {edu.courses && edu.courses.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  相关课程:
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {edu.courses.join(", ")}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                toggleEditMode(`education-${index}`)
                              }
                              className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                removeItemFromSection("education", index)
                              }
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <FiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "experience" && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  工作经验
                </h3>
                <button
                  onClick={() =>
                    addItemToSection("experience", {
                      company: "",
                      position: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      instruction: "",
                      descriptions: [],
                    })
                  }
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <FiPlus className="inline-block mr-1" /> 添加工作经验
                </button>
              </div>

              {resume.experience.length === 0 ? (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  暂无工作经验信息
                </p>
              ) : (
                <div className="space-y-4">
                  {resume.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      {editModeFields[`experience-${index}`] ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                公司
                              </label>
                              <input
                                type="text"
                                value={exp.company || ""}
                                onChange={(e) =>
                                  updateNestedField(
                                    "experience",
                                    index,
                                    "company",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                职位
                              </label>
                              <input
                                type="text"
                                value={exp.position || ""}
                                onChange={(e) =>
                                  updateNestedField(
                                    "experience",
                                    index,
                                    "position",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                地点
                              </label>
                              <input
                                type="text"
                                value={exp.location || ""}
                                onChange={(e) =>
                                  updateNestedField(
                                    "experience",
                                    index,
                                    "location",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div className="flex items-center mt-6">
                              <input
                                type="checkbox"
                                id={`current-job-${index}`}
                                checked={exp.current || false}
                                onChange={(e) =>
                                  updateNestedField(
                                    "experience",
                                    index,
                                    "current",
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`current-job-${index}`}
                                className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                当前工作
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                开始日期
                              </label>
                              <input
                                type="date"
                                value={
                                  exp.startDate
                                    ? new Date(exp.startDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  updateNestedField(
                                    "experience",
                                    index,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                结束日期
                              </label>
                              <input
                                type="date"
                                value={
                                  exp.endDate
                                    ? new Date(exp.endDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  updateNestedField(
                                    "experience",
                                    index,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                                disabled={exp.current}
                                className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 ${
                                  exp.current
                                    ? "bg-gray-100 dark:bg-gray-700"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              简介
                            </label>
                            <input
                              type="text"
                              value={exp.instruction || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  "experience",
                                  index,
                                  "instruction",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              工作描述
                            </label>
                            {(exp.descriptions || []).map((desc, descIndex) => (
                              <div key={descIndex} className="flex mb-2">
                                <textarea
                                  value={desc}
                                  onChange={(e) => {
                                    const newDescriptions = [
                                      ...(exp.descriptions || []),
                                    ];
                                    newDescriptions[descIndex] = e.target.value;
                                    updateNestedField(
                                      "experience",
                                      index,
                                      "descriptions",
                                      newDescriptions
                                    );
                                  }}
                                  rows={2}
                                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                                ></textarea>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDescriptions =
                                      exp.descriptions.filter(
                                        (_, i) => i !== descIndex
                                      );
                                    updateNestedField(
                                      "experience",
                                      index,
                                      "descriptions",
                                      newDescriptions
                                    );
                                  }}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <FiMinus />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newDescriptions = [
                                  ...(exp.descriptions || []),
                                  "",
                                ];
                                updateNestedField(
                                  "experience",
                                  index,
                                  "descriptions",
                                  newDescriptions
                                );
                              }}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                            >
                              <FiPlus className="mr-1" /> 添加描述
                            </button>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() =>
                                toggleEditMode(`experience-${index}`)
                              }
                              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200"
                            >
                              <FiSave className="inline-block mr-1" />
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {exp.company || "未指定公司"}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {exp.position || "未指定职位"}{" "}
                              {exp.location ? `· ${exp.location}` : ""}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                              {exp.startDate
                                ? new Date(exp.startDate).toLocaleDateString()
                                : "?"}{" "}
                              -
                              {exp.current
                                ? "至今"
                                : exp.endDate
                                ? new Date(exp.endDate).toLocaleDateString()
                                : "?"}
                            </p>
                            {exp.instruction && (
                              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {exp.instruction}
                              </p>
                            )}
                            {exp.descriptions &&
                              exp.descriptions.length > 0 && (
                                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {exp.descriptions.map((desc, i) => (
                                    <li key={i}>{desc}</li>
                                  ))}
                                </ul>
                              )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                toggleEditMode(`experience-${index}`)
                              }
                              className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                removeItemFromSection("experience", index)
                              }
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <FiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "projects" && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  项目经历
                </h3>
                <button
                  onClick={() =>
                    addItemToSection("projects", {
                      name: "",
                      instruction: "",
                      descriptions: [],
                      startDate: "",
                      endDate: "",
                      links: [],
                    })
                  }
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <FiPlus className="inline-block mr-1" /> 添加项目
                </button>
              </div>

              {resume.projects.length === 0 ? (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  暂无项目经历信息
                </p>
              ) : (
                <div className="space-y-4">
                  {resume.projects.map((project, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      {editModeFields[`project-${index}`] ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              项目名称
                            </label>
                            <input
                              type="text"
                              value={project.name || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  "projects",
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                开始日期
                              </label>
                              <input
                                type="date"
                                value={
                                  project.startDate
                                    ? new Date(project.startDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  updateNestedField(
                                    "projects",
                                    index,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                结束日期
                              </label>
                              <input
                                type="date"
                                value={
                                  project.endDate
                                    ? new Date(project.endDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  updateNestedField(
                                    "projects",
                                    index,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              简介
                            </label>
                            <input
                              type="text"
                              value={project.instruction || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  "projects",
                                  index,
                                  "instruction",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              工作描述
                            </label>
                            {(project.descriptions || []).map(
                              (desc, descIndex) => (
                                <div key={descIndex} className="flex mb-2">
                                  <textarea
                                    value={desc}
                                    onChange={(e) => {
                                      const newDescriptions = [
                                        ...(project.descriptions || []),
                                      ];
                                      newDescriptions[descIndex] =
                                        e.target.value;
                                      updateNestedField(
                                        "projects",
                                        index,
                                        "descriptions",
                                        newDescriptions
                                      );
                                    }}
                                    rows={2}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                                  ></textarea>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newDescriptions =
                                        project.descriptions.filter(
                                          (_, i) => i !== descIndex
                                        );
                                      updateNestedField(
                                        "projects",
                                        index,
                                        "descriptions",
                                        newDescriptions
                                      );
                                    }}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <FiMinus />
                                  </button>
                                </div>
                              )
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newDescriptions = [
                                  ...(project.descriptions || []),
                                  "",
                                ];
                                updateNestedField(
                                  "projects",
                                  index,
                                  "descriptions",
                                  newDescriptions
                                );
                              }}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                            >
                              <FiPlus className="mr-1" /> 添加描述
                            </button>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleEditMode(`project-${index}`)}
                              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200"
                            >
                              <FiSave className="inline-block mr-1" />
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {project.name || "未指定项目"}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {project.instruction || "未指定简介"}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                              {project.startDate
                                ? new Date(
                                    project.startDate
                                  ).toLocaleDateString()
                                : "?"}{" "}
                              -
                              {project.endDate
                                ? new Date(project.endDate).toLocaleDateString()
                                : "?"}
                            </p>
                            {project.descriptions &&
                              project.descriptions.length > 0 && (
                                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {project.descriptions.map((desc, i) => (
                                    <li key={i}>{desc}</li>
                                  ))}
                                </ul>
                              )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEditMode(`project-${index}`)}
                              className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                removeItemFromSection("projects", index)
                              }
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <FiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "skills" && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  技能
                </h3>
                <button
                  onClick={() =>
                    addItemToSection("skills", {
                      category: "新技能类别",
                      items: ["新技能"],
                    })
                  }
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <FiPlus className="inline-block mr-1" /> 添加技能类别
                </button>
              </div>

              {resume.skills.length === 0 ? (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  暂无技能信息
                </p>
              ) : (
                <div className="space-y-4">
                  {resume.skills.map((skillCategory, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      {editModeFields[`skill-${index}`] ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              技能类别
                            </label>
                            <input
                              type="text"
                              value={skillCategory.category || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  "skills",
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              技能列表
                            </label>
                            {(skillCategory.items || []).map(
                              (item, itemIndex) => (
                                <div key={itemIndex} className="flex mb-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newItems = [...skillCategory.items];
                                      newItems[itemIndex] = e.target.value;
                                      updateNestedField(
                                        "skills",
                                        index,
                                        "items",
                                        newItems
                                      );
                                    }}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems =
                                        skillCategory.items.filter(
                                          (_, i) => i !== itemIndex
                                        );
                                      updateNestedField(
                                        "skills",
                                        index,
                                        "items",
                                        newItems
                                      );
                                    }}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <FiMinus />
                                  </button>
                                </div>
                              )
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [
                                  ...(skillCategory.items || []),
                                  "",
                                ];
                                updateNestedField(
                                  "skills",
                                  index,
                                  "items",
                                  newItems
                                );
                              }}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                            >
                              <FiPlus className="mr-1" /> 添加技能
                            </button>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleEditMode(`skill-${index}`)}
                              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200"
                            >
                              <FiSave className="inline-block mr-1" />
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {skillCategory.category || "未分类技能"}
                            </p>
                            {skillCategory.items &&
                              skillCategory.items.length > 0 && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                  {skillCategory.items.join(", ")}
                                </p>
                              )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEditMode(`skill-${index}`)}
                              className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                removeItemFromSection("skills", index)
                              }
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <FiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "honors" && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  荣誉
                </h3>
                <button
                  onClick={() =>
                    addItemToSection("honors", {
                      name: "",
                      date: "",
                    })
                  }
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <FiPlus className="inline-block mr-1" /> 添加荣誉
                </button>
              </div>

              {resume.honors.length === 0 ? (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  暂无荣誉信息
                </p>
              ) : (
                <div className="space-y-4">
                  {resume.honors.map((honor, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      {editModeFields[`honor-${index}`] ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              荣誉名称
                            </label>
                            <input
                              type="text"
                              value={honor.name || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  "honors",
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              获得日期
                            </label>
                            <input
                              type="date"
                              value={honor.date || ""}
                              onChange={(e) =>
                                updateNestedField(
                                  "honors",
                                  index,
                                  "date",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleEditMode(`honor-${index}`)}
                              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200"
                            >
                              <FiSave className="inline-block mr-1" />
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {honor.name || "未指定荣誉"}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {honor.date || "未指定日期"}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEditMode(`honor-${index}`)}
                              className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                removeItemFromSection("honors", index)
                              }
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <FiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeVerifier;
