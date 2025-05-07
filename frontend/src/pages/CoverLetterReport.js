import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Download, FileText } from "lucide-react";

export default function CoverLetterReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoverLetter = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/cover-letters/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setCoverLetter(res.data.data);
        } else {
          setError(res.data.message || "获取求职信失败");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "获取求职信失败，请重试"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCoverLetter();
  }, [id]);

  const handleDownload = () => {
    const token = localStorage.getItem("token");
    // 直接 window.open，token通过cookie/session或后端校验
    window.open(`/api/cover-letters/${id}/download`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <span className="ml-3 text-black">正在加载求职信...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-red-50 rounded-lg p-6">
        <div className="flex items-center">
          <FileText className="text-red-500 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-red-800">加载失败</h3>
            <p className="text-red-700">{error}</p>
            <button
              className="mt-2 text-red-600 hover:underline"
              onClick={() => navigate(-1)}
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!coverLetter) return null;

  return (
    <div className="bg-white min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FileText className="text-black mr-2 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">求职信详情</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Download className="mr-2" /> 下载 PDF
            </button>
          </div>
        </div>

        {/* 求职信内容 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            收件人：{coverLetter.recipient}
          </div>
          <div className="text-2xl font-bold text-center mb-6">
            {coverLetter.subject}
          </div>
          <div className="space-y-5 text-base text-gray-900 leading-relaxed">
            {(coverLetter.paragraphs || []).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-8 text-base text-gray-900">
            {coverLetter.closing}
          </div>
          <div className="mt-8 text-base text-gray-900 text-right font-medium">
            {coverLetter.signature}
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition flex items-center"
          >
            <ArrowLeft className="inline mr-2" /> 返回
          </button>
        </div>
      </div>
    </div>
  );
}
