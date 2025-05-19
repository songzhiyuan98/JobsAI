import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiTrash,
  FiEye,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";

const CoverLetterSection = () => {
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/cover-letters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoverLetters(response.data.data);
    } catch (err) {
      setError("获取求职信列表失败");
      console.error("获取求职信列表错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除这封求职信吗？此操作不可撤销。")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/cover-letters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoverLetters(coverLetters.filter((letter) => letter._id !== id));
    } catch (err) {
      console.error("删除求职信失败:", err);
      alert("删除失败，请重试");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center p-8">
        <div className="text-center">
          <FiLoader className="animate-spin text-indigo-600 h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            正在加载您的求职信...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            我的求职信
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理您生成的所有求职信
          </p>
        </div>
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
          {coverLetters.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-5 mb-3">
                <FiFileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                还没有求职信
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
                生成您的第一封求职信，开始您的求职之旅
              </p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              {coverLetters.map((letter) => (
                <div
                  key={letter._id}
                  className="group relative p-4 sm:px-5 sm:py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg mr-3 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        <FiFileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-start">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate mr-2">
                            {letter.subject}
                          </h3>
                        </div>
                        <p className="text-xs text-left text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          收件人: {letter.recipient} · 创建于{" "}
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center sm:space-x-3">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() =>
                            navigate(`/cover-letter/${letter._id}`)
                          }
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="查看求职信"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(letter._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="删除求职信"
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

export default CoverLetterSection;
