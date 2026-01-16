import React, { useState } from "react";
import {
  FiBriefcase,
  FiInfo,
  FiEdit,
  FiX,
  FiPlus,
  FiSave,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";

const JobConfirmation = ({ parsedJob, setParsedJob, onSuccess, onCancel }) => {
  const [editMode, setEditMode] = useState({
    basicInfo: false,
    techStack: false,
    requirements: false,
    qualifications: false,
  });

  const [newTech, setNewTech] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setParsedJob({
      ...parsedJob,
      [e.target.name]: e.target.value,
    });
  };

  const handleArrayChange = (field, index, value) => {
    console.log(`更新 ${field}[${index}] = ${value}`);
    const newArray = [...parsedJob[field]];
    newArray[index] = value;
    setParsedJob({
      ...parsedJob,
      [field]: newArray,
    });
  };

  const removeArrayItem = (field, index) => {
    console.log(`删除 ${field}[${index}]`);
    const newArray = [...parsedJob[field]];
    newArray.splice(index, 1);
    console.log("更新后数组:", newArray);
    setParsedJob({
      ...parsedJob,
      [field]: newArray,
    });
  };

  const addArrayItem = (field) => {
    setParsedJob({
      ...parsedJob,
      [field]: [...(parsedJob[field] || []), ""],
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      console.log("提交的职位数据:", parsedJob);

      const url = parsedJob._id ? `/api/jobs/${parsedJob._id}` : "/api/jobs";
      const method = parsedJob._id ? "put" : "post";

      const jobData = { ...parsedJob, isVerified: true };

      const response = await axios[method](url, jobData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        console.log("保存成功:", response.data.data);
        onSuccess(response.data.data);
      } else {
        setError(response.data.message || "保存职位失败");
      }
    } catch (err) {
      console.error("保存职位错误:", err);
      setError("保存职位失败: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white text-left flex items-center">
            <FiBriefcase className="mr-2 text-indigo-500 dark:text-indigo-400" />
            确认职位信息
          </h2>

          <div className="p-4 mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-start">
              <FiInfo className="text-indigo-600 dark:text-indigo-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                我们已分析您提供的职位描述，并提取了以下信息。请检查并确认，或点击编辑按钮进行修改。
              </p>
            </div>
          </div>

          <div className="mb-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-5 py-3 border-b border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">
                基本信息
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setEditMode((prev) => ({
                    ...prev,
                    basicInfo: !prev.basicInfo,
                  }));
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm flex items-center"
              >
                <FiEdit className="mr-1" size={14} />
                {editMode.basicInfo ? "完成" : "编辑"}
              </button>
            </div>

            <div className="p-5">
              {!editMode.basicInfo ? (
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-gray-500 dark:text-gray-400 text-sm">
                      职位标题
                    </div>
                    <div className="w-2/3 text-gray-900 dark:text-gray-100 font-medium">
                      {parsedJob.title || "未指定"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-500 dark:text-gray-400 text-sm">
                      公司名称
                    </div>
                    <div className="w-2/3 text-gray-900 dark:text-gray-100">
                      {parsedJob.company || "未指定"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-500 dark:text-gray-400 text-sm">
                      工作地点
                    </div>
                    <div className="w-2/3 text-gray-900 dark:text-gray-100">
                      {parsedJob.location || "未指定"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      职位标题
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={parsedJob.title || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      公司名称
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={parsedJob.company || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      工作地点
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={parsedJob.location || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {parsedJob.tech_stack && parsedJob.tech_stack.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl overflow-hidden border border-blue-100 dark:border-blue-800/30">
              <div className="flex justify-between items-center bg-blue-100/50 dark:bg-blue-800/30 px-5 py-3 border-b border-blue-200 dark:border-blue-700/30">
                <h3 className="font-medium text-blue-700 dark:text-blue-300">
                  技术栈
                </h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditMode((prev) => ({
                      ...prev,
                      techStack: !prev.techStack,
                    }));
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center"
                >
                  <FiEdit className="mr-1" size={14} />
                  {editMode.techStack ? "完成" : "编辑"}
                </button>
              </div>

              <div className="p-5">
                {!editMode.techStack ? (
                  <div className="flex flex-wrap gap-2">
                    {parsedJob.tech_stack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-sm border border-blue-100 dark:border-blue-700/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {parsedJob.tech_stack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-sm flex items-center border border-blue-100 dark:border-blue-700/30"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeArrayItem("tech_stack", index);
                            }}
                            className="ml-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FiX size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="mb-3">
                      <div className="flex">
                        <input
                          type="text"
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          placeholder="添加技术"
                          className="flex-grow p-2 border border-blue-300 dark:border-blue-700 rounded-l-lg dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 text-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (newTech.trim()) {
                              addArrayItem("tech_stack");
                              handleArrayChange(
                                "tech_stack",
                                parsedJob.tech_stack.length - 1,
                                newTech.trim()
                              );
                              setNewTech("");
                            }
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {parsedJob.requirements && parsedJob.requirements.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl overflow-hidden border border-purple-100 dark:border-purple-800/30">
              <div className="flex justify-between items-center bg-purple-100/50 dark:bg-purple-800/30 px-5 py-3 border-b border-purple-200 dark:border-purple-700/30">
                <h3 className="font-medium text-purple-700 dark:text-purple-300">
                  职位要求
                </h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditMode((prev) => ({
                      ...prev,
                      requirements: !prev.requirements,
                    }));
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm flex items-center"
                >
                  <FiEdit className="mr-1" size={14} />
                  {editMode.requirements ? "完成" : "编辑"}
                </button>
              </div>

              <div className="p-5">
                {!editMode.requirements ? (
                  <ul className="space-y-2 list-disc list-inside text-gray-800 dark:text-gray-200">
                    {parsedJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-3">
                    {parsedJob.requirements.map((req, index) => (
                      <div key={index} className="flex items-start">
                        <textarea
                          value={req}
                          rows={2}
                          onChange={(e) => {
                            handleArrayChange(
                              "requirements",
                              index,
                              e.target.value
                            );
                          }}
                          className="flex-grow p-2 border border-purple-300 dark:border-purple-700 rounded-lg dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 text-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeArrayItem("requirements", index);
                          }}
                          className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        addArrayItem("requirements");
                      }}
                      className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
                    >
                      <FiPlus size={14} className="mr-1" /> 添加要求
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {parsedJob.preferred_qualifications &&
            parsedJob.preferred_qualifications.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-xl overflow-hidden border border-teal-100 dark:border-teal-800/30">
                <div className="flex justify-between items-center bg-teal-100/50 dark:bg-teal-800/30 px-5 py-3 border-b border-teal-200 dark:border-teal-700/30">
                  <h3 className="font-medium text-teal-700 dark:text-teal-300">
                    优先资格
                  </h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditMode((prev) => ({
                        ...prev,
                        qualifications: !prev.qualifications,
                      }));
                    }}
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm flex items-center"
                  >
                    <FiEdit className="mr-1" size={14} />
                    {editMode.qualifications ? "完成" : "编辑"}
                  </button>
                </div>

                <div className="p-5">
                  {!editMode.qualifications ? (
                    <ul className="space-y-2 list-disc list-inside text-gray-800 dark:text-gray-200">
                      {parsedJob.preferred_qualifications.map((qual, index) => (
                        <li key={index}>{qual}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-3">
                      {parsedJob.preferred_qualifications.map((qual, index) => (
                        <div key={index} className="flex items-start">
                          <textarea
                            value={qual}
                            rows={2}
                            onChange={(e) => {
                              handleArrayChange(
                                "preferred_qualifications",
                                index,
                                e.target.value
                              );
                            }}
                            className="flex-grow p-2 border border-teal-300 dark:border-teal-700 rounded-lg dark:bg-teal-900/30 text-gray-900 dark:text-gray-100 text-sm"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeArrayItem(
                                "preferred_qualifications",
                                index
                              );
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addArrayItem("preferred_qualifications");
                        }}
                        className="mt-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center"
                      >
                        <FiPlus size={14} className="mr-1" /> 添加优先资格
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg text-red-800 dark:text-red-300 flex items-center">
            <FiAlertCircle className="flex-shrink-0 mr-2" />
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center"
          disabled={loading}
        >
          <FiX className="mr-2" /> 取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          disabled={loading}
        >
          <FiSave className="mr-2" /> {loading ? "保存中..." : "确认保存"}
        </button>
      </div>
    </form>
  );
};

export default JobConfirmation;
