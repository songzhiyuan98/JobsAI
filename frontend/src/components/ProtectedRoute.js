import React from "react";
import { useSelector } from "react-redux";
import LoginReminderModal from "./loginmodal";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 直接渲染弹窗
    return <LoginReminderModal show={true} onClose={() => {}} />;
  }

  // 给受保护路由内容添加顶部间距
  return <div>{children}</div>;
};

export default ProtectedRoute;
