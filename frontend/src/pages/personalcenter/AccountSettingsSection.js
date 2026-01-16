import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiAward, FiLoader, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const AccountSettingsSection = () => {
  const { subscriptionStatus } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingUsage, setRemainingUsage] = useState({
    analysis: 0,
    coverLetter: 0,
  });
  const [, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data.data);
      setError(null);
    } catch (err) {
      setError("获取用户信息失败");
      console.error("获取用户信息错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRemainingUsage = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/subscription/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRemainingUsage(response.data.remainingUsage);
    } catch (err) {
      console.error("获取剩余使用次数失败:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchRemainingUsage();
  }, []);

  const getPlanName = (status) => {
    switch (status) {
      case "premium":
        return "会员版";
      case "enterprise":
        return "企业版";
      default:
        return "免费版";
    }
  };

  const getPlanFeatures = (status) => {
    switch (status) {
      case "premium":
        return {
          models: {
            gemini: "无限次",
            gpt4o: "无限次",
            gpt01: "无限次",
          },
          features: {
            coverLetters: "无限次",
            resumeAnalysis: "无限次",
            jobAnalysis: "无限次",
            interviewPrep: "无限次",
            customTemplates: "支持",
          },
        };
      case "enterprise":
        return {
          models: {
            gemini: "无限次",
            gpt4o: "无限次",
            gpt01: "无限次",
          },
          features: {
            coverLetters: "无限次",
            resumeAnalysis: "无限次",
            jobAnalysis: "无限次",
            interviewPrep: "无限次",
            customTemplates: "支持",
            teamManagement: "支持",
            prioritySupport: "支持",
          },
        };
      default:
        return {
          models: {
            gemini: "无限次",
            gpt4o: `${
              remainingUsage.analysis + remainingUsage.coverLetter
            }次/天`,
            gpt01: "不可用",
          },
          features: {
            coverLetters: `${remainingUsage.coverLetter}次/天`,
            resumeAnalysis: `${remainingUsage.analysis}次/天`,
            jobAnalysis: "3次/月",
            interviewPrep: "不可用",
            customTemplates: "不可用",
          },
        };
    }
  };

  const getFeatureDescription = (feature) => {
    switch (feature) {
      case "coverLetters":
        return "AI 求职信生成";
      case "resumeAnalysis":
        return "AI 简历分析";
      case "jobAnalysis":
        return "AI 职位分析";
      case "interviewPrep":
        return "AI 面试准备";
      case "customTemplates":
        return "自定义模板";
      case "teamManagement":
        return "团队管理";
      case "prioritySupport":
        return "优先支持";
      case "gemini":
        return "Gemini 模型";
      case "gpt4o":
        return "GPT-4o 模型";
      case "gpt01":
        return "GPT-o1 模型";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center p-8">
        <div className="text-center">
          <FiLoader className="animate-spin text-indigo-600 h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            正在加载账户信息...
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
            获取账户信息失败
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
            {error}
          </p>
          <button
            onClick={fetchUserData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            账户设置
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            查看您的账户信息和会员权益
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 会员计划 */}
        <div className="md:col-span-1">
          <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                  <FiAward className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  会员计划
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    当前计划
                  </div>
                  <div className="text-base font-medium text-gray-900 dark:text-white mt-1">
                    {getPlanName(subscriptionStatus)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    AI 模型使用权限
                  </div>
                  <div className="space-y-3 mt-1">
                    {Object.entries(
                      getPlanFeatures(subscriptionStatus).models
                    ).map(([model, limit]) => (
                      <div key={model} className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {getFeatureDescription(model)}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {limit}
                          </span>
                        </div>
                        {!limit.includes("无限") &&
                          !limit.includes("不可用") && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              每日重置
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    功能使用权限
                  </div>
                  <div className="space-y-3 mt-1">
                    {Object.entries(
                      getPlanFeatures(subscriptionStatus).features
                    ).map(([feature, limit]) => (
                      <div key={feature} className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {getFeatureDescription(feature)}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {limit}
                          </span>
                        </div>
                        {!limit.includes("无限") &&
                          !limit.includes("不可用") &&
                          !limit.includes("支持") && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              每日重置
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
                {subscriptionStatus !== "premium" &&
                  subscriptionStatus !== "enterprise" && (
                    <button
                      onClick={() => (window.location.href = "/pricing")}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      升级会员
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsSection;
