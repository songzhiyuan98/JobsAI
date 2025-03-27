import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiEdit,
  FiTrash,
  FiCheck,
  FiPlus,
  FiLoader,
  FiArrowLeft,
  FiDownload,
  FiEye,
  FiAlertTriangle,
  FiClock,
  FiStar,
} from "react-icons/fi";
import axios from "axios";
import ResumeUploader from "./ResumeUploader";
import ResumeVerifier from "./ResumeVerifier";
import ResumePreview from "./ResumePreview";

const ResumeManager = ({ onClose, onResumeChange }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [previewResumeId, setPreviewResumeId] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
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
  };

  const handleResumeUploadSuccess = (resume) => {
    setShowUploader(false);

    if (!resume.isVerified) {
      setEditingResumeId(resume._id);
    } else {
      if (resumes.length === 0) {
        setActiveResumeId(resume._id);
        setResumeAsActive(resume._id);
      }

      setResumes([...resumes, resume]);
    }
  };

  const handleEditComplete = (verifiedResume) => {
    setEditingResumeId(null);

    const updatedResumes = resumes.map((r) =>
      r._id === verifiedResume._id ? verifiedResume : r
    );

    if (!activeResumeId) {
      setActiveResumeId(verifiedResume._id);
      setResumeAsActive(verifiedResume._id);
    }

    setResumes(
      updatedResumes.includes(verifiedResume)
        ? updatedResumes
        : [...updatedResumes, verifiedResume]
    );
  };

  const setResumeAsActive = async (resumeId) => {
    const resumeToActivate = resumes.find((r) => r._id === resumeId);

    if (resumeToActivate && !resumeToActivate.isVerified) {
      if (
        window.confirm(
          "该简历尚未验证，需要先验证后才能设为当前简历。是否立即验证？"
        )
      ) {
        setEditingResumeId(resumeId);
        return;
      } else {
        return;
      }
    }

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
          const newActiveResume = updatedResumes.find((r) => r.isVerified);
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

  const editResume = (resumeId) => {
    setEditingResumeId(resumeId);
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
        onEdit={() => {
          setEditingResumeId(previewResumeId);
          setPreviewResumeId(null);
        }}
      />
    );
  }

  if (editingResumeId) {
    return (
      <ResumeVerifier
        resumeId={editingResumeId}
        onVerified={handleEditComplete}
        onCancel={() => setEditingResumeId(null)}
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="flex flex-col items-start">
          <button
            onClick={onClose}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 transition-colors"
          >
            <FiArrowLeft className="mr-1.5" /> 返回仪表盘
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            我的简历库
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理您的所有简历，用于不同的求职场景
          </p>
        </div>

        <button
          onClick={() => setShowUploader(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-lg text-white bg-indigo-600/90 dark:bg-indigo-600/80 hover:bg-indigo-700/90 dark:hover:bg-indigo-700/80 border border-transparent text-sm font-medium backdrop-blur-sm shadow-sm hover:shadow transition-all"
        >
          <FiPlus className="mr-2" /> 上传简历
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-300">
          <div className="flex">
            <FiAlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div>
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl backdrop-blur-lg bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-10 text-center">
              <div className="bg-indigo-100/70 dark:bg-indigo-900/30 backdrop-blur-sm rounded-full p-6 mb-4">
                <FiFileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                还没有上传简历
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                上传您的第一份简历，开始获取针对性的求职建议和职位匹配
              </p>
              <button
                onClick={() => setShowUploader(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-indigo-600/90 dark:bg-indigo-600/80 hover:bg-indigo-700/90 dark:hover:bg-indigo-700/80 border border-transparent text-sm font-medium backdrop-blur-sm shadow-sm hover:shadow transition-all"
              >
                <FiPlus className="mr-2" /> 上传简历
              </button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden backdrop-blur-lg bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 shadow-sm divide-y divide-gray-200/70 dark:divide-gray-700/50">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className={`group relative p-4 sm:px-6 sm:py-5 transition-colors backdrop-blur-sm ${
                    resume._id === activeResumeId
                      ? "bg-indigo-50/50 dark:bg-indigo-900/20"
                      : "hover:bg-gray-50/70 dark:hover:bg-gray-700/30"
                  }`}
                >
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center min-w-0">
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-lg mr-3 flex items-center justify-center ${
                          resume._id === activeResumeId
                            ? "bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                            : "bg-gray-100/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <FiFileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-start">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate mr-2">
                            {resume.name}
                          </h3>
                          {resume.isVerified ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100/70 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              <FiCheck className="mr-0.5 h-3 w-3" /> 已验证
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                              <FiAlertTriangle className="mr-0.5 h-3 w-3" />{" "}
                              待验证
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-left text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          上传于{" "}
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center sm:space-x-3">
                      {resume._id === activeResumeId ? (
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg">
                          <FiCheck className="mr-1 h-3 w-3" /> 当前使用
                        </span>
                      ) : (
                        <button
                          onClick={() => setResumeAsActive(resume._id)}
                          className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 bg-transparent hover:bg-gray-100/80 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          设为当前
                        </button>
                      )}

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => previewResume(resume._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="预览简历"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => editResume(resume._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="编辑简历"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => downloadResume(resume._id)}
                          disabled={downloadLoading === resume._id}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50"
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
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
