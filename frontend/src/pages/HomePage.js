import React, { useState } from "react";
import {
  FiMenu,
  FiPlus,
  FiUser,
  FiUpload,
  FiSearch,
  FiSend,
  FiFileText,
  FiMessageSquare,
  FiBriefcase,
  FiLogIn,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "欢迎使用 AI 面试助手！我可以帮您：\n1. 分析简历与职位匹配度\n2. 生成面试问题\n3. 提供面试反馈\n4. 优化简历内容\n\n请问您需要什么帮助？",
    },
  ]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // 添加用户消息
    const newHistory = [...chatHistory, { role: "user", content: message }];
    setChatHistory(newHistory);

    // 清空输入框
    setMessage("");

    // 模拟 AI 回复
    setTimeout(() => {
      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          content:
            "我可以帮您生成一些前端开发工程师的面试问题。请先上传您的简历，或者告诉我您感兴趣的具体领域（如React、Vue、性能优化等），这样我可以提供更针对性的问题。",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 欢迎区域 */}
        <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white mb-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">AI 驱动的面试助手</h1>
            <p className="text-xl mb-6">让面试准备更智能、更高效、更有针对性</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center">
                <FiUpload className="mr-2" />
                上传简历
              </button>
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium flex items-center">
                <FiSearch className="mr-2" />
                浏览职位
              </button>
            </div>
          </div>
        </div>

        {/* 主要功能区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* 简历分析 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              <FiFileText className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              简历分析
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AI 分析您的简历与职位的匹配度，提供改进建议。
            </p>
            <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center">
              开始分析 <span className="ml-1">→</span>
            </button>
          </div>

          {/* 面试模拟 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <FiMessageSquare className="text-green-600 dark:text-green-400 text-xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              面试模拟
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              根据职位要求和您的简历，生成针对性的面试问题。
            </p>
            <button className="text-green-600 dark:text-green-400 font-medium hover:underline flex items-center">
              开始模拟 <span className="ml-1">→</span>
            </button>
          </div>

          {/* 职位匹配 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
              <FiBriefcase className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              职位匹配
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              从数据库中找到与您技能最匹配的职位机会。
            </p>
            <Link
              to="/jobs"
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center"
            >
              查看职位 <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* 最新职位列表 */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              最新职位
            </h2>
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
            {/* 职位卡片 */}
            {[1, 2, 3].map((job, index) => (
              <div
                key={index}
                className={`p-6 ${
                  index < 2
                    ? "border-b border-gray-200 dark:border-gray-700"
                    : ""
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      前端开发工程师
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      字节跳动 · 上海
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        React
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        JavaScript
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        3年+
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-green-600 dark:text-green-400 font-semibold mb-2">
                      30-45K·16薪
                    </span>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      分析匹配度
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400">
              © 2023 JobsAI. 保留所有权利
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                关于我们
              </a>
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                使用条款
              </a>
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                隐私政策
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
