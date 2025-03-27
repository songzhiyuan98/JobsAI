import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 重定向到登录页面，并保存原始目标路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 给受保护路由内容添加顶部间距
  return <div className="pt-10">{children}</div>;
};

export default ProtectedRoute;
