import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiFileText,
  FiCheck,
  FiAlertTriangle,
  FiRefreshCw,
  FiEdit,
  FiList,
  FiArrowRight,
  FiBriefcase,
  FiBook,
  FiEye,
} from "react-icons/fi";
import axios from "axios";
import ResumeUploader from "../components/ResumeUploader";
import ResumeManager from "../components/ResumeManager";
import ResumeVerifier from "../components/ResumeVerifier";
import ResumePreview from "../components/ResumePreview";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showResumeManager, setShowResumeManager] = useState(false);
  const [resumeToVerify, setResumeToVerify] = useState(null);
  const [recentResume, setRecentResume] = useState(null);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [previewResumeId, setPreviewResumeId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("未登录");

        // 获取用户信息
        const response = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data.data);

        // 获取最近的简历信息
        try {
          const resumeResponse = await axios.get("/api/resumes/active", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (resumeResponse.data.success) {
            setRecentResume(resumeResponse.data.data);
          }
        } catch (resumeErr) {
          console.error("获取简历信息失败:", resumeErr);
          // 不会中断主要数据加载
        }
      } catch (err) {
        console.error("获取用户数据失败:", err);
        setError("无法加载您的信息，请稍后再试");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleResumeUploadSuccess = (resume) => {
    setShowUploader(false);
    // 如果简历需要验证
    if (!resume.isVerified) {
      setResumeToVerify(resume._id);
    } else {
      setRecentResume(resume);
    }
  };

  const handleResumeVerified = (resume) => {
    setResumeToVerify(null);
    setRecentResume(resume);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 max-w-2xl mx-auto text-center border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center">
            <div className="flex items-center justify-center bg-red-100 dark:bg-red-900/30 h-16 w-16 rounded-full mb-4">
              <FiAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            数据加载失败
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "无法加载您的信息，请稍后再试"}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiRefreshCw className="mr-2" /> 重新加载
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">您可以尝试以下操作：</p>
              <ul className="list-disc list-inside space-y-1 text-left mx-auto max-w-md">
                <li>检查您的网络连接</li>
                <li>清除浏览器缓存后重试</li>
                <li>确认您的登录状态是否有效</li>
                <li>
                  如果问题持续存在，请
                  <a
                    href="/contact"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                  >
                    联系我们的支持团队
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果有简历需要验证，显示验证组件
  if (resumeToVerify) {
    return (
      <div className="mt-10">
        <ResumeVerifier
          resumeId={resumeToVerify}
          onVerified={handleResumeVerified}
          onCancel={() => setResumeToVerify(null)}
        />
      </div>
    );
  }

  // 如果用户选择上传简历，显示上传组件
  if (showUploader) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ResumeUploader
          onSuccess={handleResumeUploadSuccess}
          onCancel={() => setShowUploader(false)}
          existingResumes={user?.resumes || []}
        />
      </div>
    );
  }

  // 如果用户选择管理简历，显示管理组件
  if (showResumeManager) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ResumeManager
          onClose={() => setShowResumeManager(false)}
          onResumeChange={(resume) => setRecentResume(resume)}
        />
      </div>
    );
  }

  // 如果用户选择预览简历，显示预览组件
  if (showResumePreview && previewResumeId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ResumePreview
          resumeId={previewResumeId}
          onClose={() => {
            setShowResumePreview(false);
            setPreviewResumeId(null);
          }}
          onEdit={() => {
            setShowResumePreview(false);
            setPreviewResumeId(null);
            setResumeToVerify(previewResumeId);
          }}
        />
      </div>
    );
  }

  // 默认显示仪表盘
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        欢迎, {user?.name || "用户"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 左侧 - 简历和快速开始 */}
        <div className="md:col-span-7">
          {/* 简历上传卡片 - 改进布局 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiFileText className="mr-2 text-indigo-500 dark:text-indigo-400" />
                您的简历
              </h2>

              {recentResume && (
                <button
                  onClick={() => setShowResumeManager(true)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <FiList className="mr-1.5" /> 管理简历
                </button>
              )}
            </div>

            {!recentResume ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 bg-gray-50 dark:bg-gray-700/30">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                  <FiUpload className="text-3xl text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  没有简历
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-5 max-w-md">
                  上传您的简历以便AI分析并提供更好的面试建议，提高您的面试成功率
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg transition flex items-center shadow-sm hover:shadow"
                >
                  <FiFileText className="mr-2" /> 上传简历
                </button>
              </div>
            ) : (
              <div>
                {/* 改进简历信息卡片布局 */}
                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-600/40">
                  {/* 上部分：简历基本信息和操作 */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center">
                    <div className="flex items-center flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3">
                        <FiFileText className="text-lg text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 text-base truncate max-w-[150px] sm:max-w-full">
                          {recentResume.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(
                            recentResume.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* 状态标签和操作按钮 */}
                    <div className="flex items-center justify-between sm:justify-end sm:ml-auto sm:space-x-3 w-full">
                      {recentResume.isVerified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          <FiCheck className="mr-1" /> 已验证
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                          <FiAlertTriangle className="mr-1" /> 待验证
                        </span>
                      )}

                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setPreviewResumeId(recentResume._id);
                            setShowResumePreview(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                          title="预览简历"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setResumeToVerify(recentResume._id)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                          title="编辑简历"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 下部分：技能标签，使用更紧凑的布局 */}
                  {recentResume.skills?.flatMap(
                    (skillGroup) => skillGroup.items || []
                  ).length > 0 && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-600/40">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        技能标签:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {recentResume.skills
                          ?.flatMap((skillGroup) => skillGroup.items || [])
                          .slice(0, 8)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60"
                            >
                              {skill}
                            </span>
                          ))}
                        {(recentResume.skills?.flatMap(
                          (skillGroup) => skillGroup.items || []
                        ).length || 0) > 8 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            +
                            {(recentResume.skills?.flatMap(
                              (skillGroup) => skillGroup.items || []
                            ).length || 0) - 8}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 未验证提示 */}
                {!recentResume.isVerified && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-sm rounded-lg flex items-start">
                    <FiAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>
                      请点击"编辑简历"按钮完成验证，以便AI更准确地为您推荐职位。
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 快速开始卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              快速开始
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/jobs")}
                disabled={!recentResume}
                className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition ${
                  recentResume
                    ? "bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                    : "bg-gray-50 dark:bg-gray-700/30 opacity-70 cursor-not-allowed"
                }`}
              >
                <FiBriefcase
                  className={`text-3xl mb-2 ${
                    recentResume
                      ? "text-indigo-500 dark:text-indigo-400"
                      : "text-gray-400"
                  }`}
                />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  浏览职位
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  浏览匹配的职位并进行模拟面试
                </p>
              </button>

              <button
                onClick={() => navigate("/analysis/start")}
                disabled={!recentResume}
                className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition ${
                  recentResume
                    ? "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40"
                    : "bg-gray-50 dark:bg-gray-700/30 opacity-70 cursor-not-allowed"
                }`}
              >
                <FiBook
                  className={`text-3xl mb-2 ${
                    recentResume
                      ? "text-green-500 dark:text-green-400"
                      : "text-gray-400"
                  }`}
                />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  开始练习
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  立即开始常见面试问题练习
                </p>
              </button>
            </div>

            {!recentResume && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300 text-sm rounded-lg">
                <p className="flex items-center">
                  <FiAlertTriangle className="mr-2 flex-shrink-0" />
                  请先上传简历才能使用这些功能
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧 - 推荐和消息 */}
        <div className="md:col-span-5">
          {/* 系统通知卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              系统通知
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg">
                <p className="text-indigo-800 dark:text-indigo-300 text-sm">
                  欢迎使用AI面试助手！上传您的简历，开始准备面试吧。
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-1">
                  刚刚
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 mt-4">
        <button
          onClick={() => navigate("/job-submitter")}
          className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
              <FiBriefcase className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                添加职位
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                添加职位描述开始模拟面试
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/job-manager")}
          className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
              <FiList className="text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                职位管理
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                管理已保存的职位描述
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
