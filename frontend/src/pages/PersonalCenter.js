import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  FileText,
  BarChart2,
  Settings,
  ChevronRight,
} from "lucide-react";
import OverviewSection from "./personalcenter/OverviewSection";
import ResumeSection from "./personalcenter/ResumeSection";
import AnalysisSection from "./personalcenter/AnalysisSection";
import ProfileSection from "./personalcenter/ProfileSection";

// 仪表板导航项
const navItems = [
  { id: "overview", label: "个人中心", icon: <User size={18} /> },
  { id: "resumes", label: "简历管理", icon: <FileText size={18} /> },
  { id: "analysis", label: "职位管理", icon: <BarChart2 size={18} /> },
  { id: "profile", label: "个人设置", icon: <Settings size={18} /> },
];

export default function PersonalCenter() {
  const [activePage, setActivePage] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data.data);
    } catch (err) {
      setError("获取用户信息失败");
      console.error("获取用户信息错误:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-800">
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">个人中心</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* 侧边导航 */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {userData?.googleProfile?.picture ? (
                      <img
                        src={userData.googleProfile.picture}
                        alt={userData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-900">
                      {userData?.name || "未设置"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {userData?.email || "未设置邮箱"}
                    </div>
                    {userData?.authProviders?.some(
                      (p) => p.provider === "google"
                    ) && (
                      <div className="text-xs text-gray-400 mt-1">
                        通过 Google 登录
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full flex items-center px-4 py-3 rounded-md text-left transition-colors ${
                      activePage === item.id
                        ? "bg-gray-100 text-black font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setActivePage(item.id)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                    {activePage === item.id && (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          {/* 主内容区域 */}
          <div className="flex-1 ml-4">
            {activePage === "overview" && <OverviewSection />}
            {activePage === "resumes" && <ResumeSection />}
            {activePage === "analysis" && <AnalysisSection />}
            {activePage === "profile" && <ProfileSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
