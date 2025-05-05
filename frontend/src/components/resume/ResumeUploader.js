import React, { useState, useRef } from "react";
import {
  FiUpload,
  FiFile,
  FiX,
  FiCheck,
  FiLoader,
  FiAlertTriangle,
  FiArrowLeft,
  FiFileText,
  FiType,
} from "react-icons/fi";
import axios from "axios";

const ResumeUploader = ({ onSuccess, onCancel, existingResumes }) => {
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeName, setResumeName] = useState("我的简历");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // 只接受PDF文件
    if (selectedFile.type !== "application/pdf") {
      setError("请上传PDF格式的简历文件");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB限制
      setError("文件大小不能超过5MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // 创建文件预览URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    // 自动使用文件名（不带扩展名）作为简历名称
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
    if (fileName && fileName !== "我的简历") {
      setResumeName(fileName);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const uploadResume = async () => {
    if (!file) {
      setError("请选择文件");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("name", resumeName);

      const token = localStorage.getItem("token");
      const response = await axios.post("/api/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // 先清理状态
        setFile(null);
        setFilePreviewUrl(null);
        setResumeName("我的简历");
        setUploading(false);

        // 延迟调用onSuccess，确保状态更新完成
        setTimeout(() => {
          onSuccess(response.data.data);
        }, 0);
      }
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || "上传简历失败");
      console.error("上传简历错误:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <FiArrowLeft className="mr-1.5" /> 返回
        </button>
      </div>

      <div className="rounded-2xl backdrop-blur-lg bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 bg-white/20 dark:bg-gray-900/20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {existingResumes?.length > 0 ? "上传新简历" : "上传您的简历"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            支持PDF格式，最大5MB
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50/70 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-300 flex items-start">
              <FiAlertTriangle className="flex-shrink-0 mt-0.5 mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              简历名称
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiType className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                className="w-full pl-10 px-4 py-2.5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/80 dark:border-gray-600/80 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all"
                placeholder="例如：前端开发简历"
              />
            </div>
          </div>

          {file ? (
            <div className="mb-6 p-5 border border-gray-200/70 dark:border-gray-700/70 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100/80 dark:bg-indigo-900/30 backdrop-blur-sm rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FiFileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setFilePreviewUrl(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                  aria-label="移除文件"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`mb-6 cursor-pointer rounded-lg border-2 border-dashed transition-all ${
                dragActive
                  ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
              } backdrop-blur-sm p-8 text-center`}
              onClick={() => fileInputRef.current.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/pdf"
              />
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100/70 dark:bg-gray-700/50 flex items-center justify-center mb-4">
                <FiUpload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {dragActive ? "释放文件以上传" : "拖放或点击上传文件"}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                支持PDF格式，最大5MB
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-8">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100/70 dark:bg-gray-700/50 hover:bg-gray-200/70 dark:hover:bg-gray-600/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={uploadResume}
              disabled={!file || uploading}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white backdrop-blur-sm flex items-center shadow-sm transition-all ${
                !file || uploading
                  ? "bg-indigo-400/90 dark:bg-indigo-600/50 cursor-not-allowed"
                  : "bg-indigo-600/90 dark:bg-indigo-600/80 hover:bg-indigo-700/90 dark:hover:bg-indigo-700/80 hover:shadow"
              }`}
            >
              {uploading ? (
                <>
                  <FiLoader className="animate-spin mr-2 h-4 w-4" />
                  上传中...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2 h-4 w-4" />
                  上传并分析
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
