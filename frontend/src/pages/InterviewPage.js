import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSend, FiClock, FiArrowLeft, FiLoader } from "react-icons/fi";

const InterviewPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [interview, setInterview] = useState(null);
  const messagesEndRef = useRef(null);

  // 获取面试数据
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/interviews/${interviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setInterview(response.data.data.interview);
          setMessages(response.data.data.messages);
          setProgress(response.data.data.progress);
        }
      } catch (err) {
        setError("获取面试数据失败: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    try {
      setSending(true);
      const newMessage = { role: "user", content: inputMessage };
      setMessages([...messages, newMessage]);
      setInputMessage("");

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/interviews/message",
        {
          interviewId: interviewId,
          message: inputMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // 添加AI回复
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.data.data.message,
          },
        ]);

        // 更新进度
        setProgress(response.data.data.progress);

        // 如果面试完成，显示总结按钮
        if (response.data.data.isComplete) {
          setInterview((prev) => ({ ...prev, status: "completed" }));
        }
      }
    } catch (err) {
      setError("发送消息失败: " + err.message);
    } finally {
      setSending(false);
    }
  };

  // 键盘快捷键
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 面试头部 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {interview?.job?.title || "面试"} -{" "}
              {interview?.resume?.name || "候选人"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FiClock className="mr-1" />
              <span className="text-sm">进度: {Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === "assistant"
                    ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    : "bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-bounce mr-2">⌛</div>
                  <div>思考中...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 输入区域 */}
      {interview?.status !== "completed" ? (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto flex">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的回答..."
              className="flex-1 rounded-l-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !inputMessage.trim()}
              className={`rounded-r-lg px-4 py-2 flex items-center justify-center ${
                sending || !inputMessage.trim()
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {sending ? <FiLoader className="animate-spin" /> : <FiSend />}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-800 dark:text-green-200">
              面试已完成！
            </div>
            <button
              onClick={() => navigate(`/interview/${interviewId}/summary`)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              查看面试总结
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 font-bold">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
