import React, { useState } from "react";
import { FiBookOpen, FiRefreshCw, FiMessageSquare } from "react-icons/fi";

const InterviewQuestions = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  // 示例问题数据
  const sampleQuestions = [
    {
      question: "什么是React的虚拟DOM，它有什么优势？",
      answer:
        "虚拟DOM是React中的一个概念，它是对实际DOM的轻量级JavaScript表示。React使用虚拟DOM来提高性能，通过比较新旧虚拟DOM的差异，最小化对实际DOM的操作。这减少了浏览器重绘和重排的次数，提高了应用性能。",
    },
    {
      question: "解释React中的状态提升（State Lifting）",
      answer:
        "状态提升是React中的一种模式，当多个组件需要共享相同的状态数据时，我们可以将状态移动到它们的最近共同父组件中。这样能确保数据的一致性，并通过props将数据和更新函数传递给子组件。",
    },
    {
      question: "JavaScript中的闭包是什么？举例说明它的用途。",
      answer:
        "闭包是指函数能够记住并访问其词法作用域，即使该函数在其作用域之外执行。用途包括：创建私有变量、数据封装、实现函数工厂、处理回调等。",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // 模拟API调用
    setTimeout(() => {
      setQuestions(sampleQuestions);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <FiBookOpen className="mr-2" />
          面试问题练习
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入技术/职位关键词，如：React, JavaScript, 前端开发"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            {loading ? (
              <FiRefreshCw className="animate-spin mr-2" />
            ) : (
              <FiMessageSquare className="mr-2" />
            )}
            {loading ? "生成中..." : "生成问题"}
          </button>
        </div>
      </form>

      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                  {index + 1}. {q.question}
                </h3>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300">{q.answer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          输入关键词生成针对性面试问题和参考答案
        </div>
      )}
    </div>
  );
};

export default InterviewQuestions;
