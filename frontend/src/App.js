import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";
import { useDispatch } from "react-redux";
import { authRequest, authSuccess, authFail } from "./store/authSlice";
import authService from "./services/authService";
import JobManagerPage from "./pages/JobManagerPage";
import JobSubmitterPage from "./pages/JobSubmitterPage";
import AnalysisStartPage from "./pages/AnalysisStartPage";
import AnalysisResultPage from "./pages/AnalysisResultPage";
import "./styles/print.css";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        dispatch(authRequest());
        try {
          // 设置token
          authService.setAuthToken(token);
          // 获取用户信息
          const userData = await authService.getCurrentUser();
          dispatch(
            authSuccess({
              user: userData.data,
              token,
            })
          );
        } catch (error) {
          dispatch(authFail(error.message || "会话已过期"));
          authService.logout();
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* 受保护路由 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job/:id"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-manager"
            element={
              <ProtectedRoute>
                <JobManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-submitter"
            element={
              <ProtectedRoute>
                <JobSubmitterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/start"
            element={
              <ProtectedRoute>
                <AnalysisStartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:id"
            element={
              <ProtectedRoute>
                <AnalysisResultPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
