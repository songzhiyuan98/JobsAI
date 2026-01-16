import React, { useState, useEffect, useCallback } from "react";
import {
  FiFileText,
  FiEdit,
  FiTrash,
  FiCheck,
  FiPlus,
  FiLoader,
  FiDownload,
  FiEye,
  FiAlertTriangle,
} from "react-icons/fi";
import axios from "axios";
import ResumeUploader from "./ResumeUploader";
import ResumePreview from "./ResumePreview";
import ResumeVerifier from "./ResumeVerifier";

const ResumeManager = ({ onResumeChange }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [previewResumeId, setPreviewResumeId] = useState(null);
  const [editingResumeId, setEditingResumeId] = useState(null);

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/resumes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResumes(response.data.data);
      const activeResume = response.data.data.find((r) => r.isActive);
      if (activeResume) {
        setActiveResumeId(activeResume._id);
        onResumeChange && onResumeChange(activeResume);
      }

      setLoading(false);
    } catch (err) {
      setError("获取简历失败");
      setLoading(false);
      console.error("获取简历错误:", err);
    }
  }, [onResumeChange]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleResumeUploadSuccess = (resume) => {
    setShowUploader(false);
    if (resumes.length === 0) {
      setActiveResumeId(resume._id);
      setResumeAsActive(resume._id);
    }
    setResumes([...resumes, resume]);
  };

  const setResumeAsActive = async (resumeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/resumes/${resumeId}/set-active`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const activeResume = resumes.find((r) => r._id === resumeId);

      if (activeResume && onResumeChange) {
        onResumeChange(activeResume);
      }

      setActiveResumeId(resumeId);
      setResumes(
        resumes.map((resume) => ({
          ...resume,
          isActive: resume._id === resumeId,
        }))
      );
    } catch (err) {
      console.error("设置激活简历错误:", err);
    }
  };

  const deleteResume = async (resumeId) => {
    if (window.confirm("确定要删除此简历吗？此操作不可撤销。")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/resumes/${resumeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedResumes = resumes.filter((r) => r._id !== resumeId);
        setResumes(updatedResumes);

        if (resumeId === activeResumeId) {
          const newActiveResume = updatedResumes[0];
          if (newActiveResume) {
            setActiveResumeId(newActiveResume._id);
            setResumeAsActive(newActiveResume._id);
          } else {
            setActiveResumeId(null);
            onResumeChange && onResumeChange(null);
          }
        }
      } catch (err) {
        console.error("删除简历错误:", err);
      }
    }
  };

  const downloadResume = async (resumeId) => {
    try {
      setDownloadLoading(resumeId);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/resumes/${resumeId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const resume = resumes.find((r) => r._id === resumeId);
      const filename = `${resume?.name || "resume"}.pdf`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadLoading(null);
    } catch (err) {
      setDownloadLoading(null);
      console.error("下载简历错误:", err);
    }
  };

  const previewResume = (resumeId) => {
    setPreviewResumeId(resumeId);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center p-8">
        <div className="text-center">
          <FiLoader className="animate-spin text-indigo-600 h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            正在加载您的简历...
          </p>
        </div>
      </div>
    );
  }

  if (previewResumeId) {
    return (
      <ResumePreview
        resumeId={previewResumeId}
        onClose={() => setPreviewResumeId(null)}
      />
    );
  }

  if (showUploader) {
    return (
      <ResumeUploader
        onSuccess={handleResumeUploadSuccess}
        onCancel={() => setShowUploader(false)}
      />
    );
  }

  if (editingResumeId) {
    return (
      <ResumeVerifier
        resumeId={editingResumeId}
        onClose={() => setEditingResumeId(null)}
        onSuccess={() => {
          setEditingResumeId(null);
          fetchResumes();
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            我的简历库
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理您的所有简历，用于不同的求职场景
          </p>
        </div>

        <button
          onClick={() => setShowUploader(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-lg text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-sm font-medium"
        >
          <FiPlus className="mr-2" /> 上传简历
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-800 dark:text-red-300">
          <div className="flex">
            <FiAlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-5 mb-3">
                <FiFileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                还没有上传简历
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
                上传您的第一份简历，开始获取针对性的求职建议和职位匹配
              </p>
              <button
                onClick={() => setShowUploader(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-sm font-medium"
              >
                <FiPlus className="mr-2" /> 上传简历
              </button>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className={`group relative p-4 sm:px-5 sm:py-4 transition-colors ${
                    resume._id === activeResumeId
                      ? "bg-gray-50 dark:bg-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center min-w-0">
                      <div
                        className={`flex-shrink-0 h-8 w-8 rounded-lg mr-3 flex items-center justify-center ${
                          resume._id === activeResumeId
                            ? "bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <FiFileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-start">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate mr-2">
                            {resume.name}
                          </h3>
                          {resume.isActive && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <FiCheck className="mr-0.5 h-3 w-3" /> 当前使用
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-left text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          上传于{" "}
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center sm:space-x-3">
                      {resume._id === activeResumeId ? (
                        <span className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg">
                          <FiCheck className="mr-1 h-3 w-3" /> 当前使用
                        </span>
                      ) : (
                        <button
                          onClick={() => setResumeAsActive(resume._id)}
                          className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          设为当前
                        </button>
                      )}

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setEditingResumeId(resume._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="编辑简历"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => previewResume(resume._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="预览简历"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => downloadResume(resume._id)}
                          disabled={downloadLoading === resume._id}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                          title="下载简历"
                        >
                          {downloadLoading === resume._id ? (
                            <FiLoader className="h-4 w-4 animate-spin" />
                          ) : (
                            <FiDownload className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => deleteResume(resume._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="删除简历"
                        >
                          <FiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
