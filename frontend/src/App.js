import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";
import { useDispatch } from "react-redux";
import { authRequest, authSuccess, authFail } from "./store/authSlice";
import authService from "./services/authService";
import JobManagerPage from "./pages/JobManagerPage";
import JobSubmitterPage from "./pages/JobSubmitterPage";
import AnalysisStartPage from "./pages/AnalysisStartPage";
import GeminiAnalysisReport from "./components/analysis/GeminiAnalysisReport";
import Gpt4oAnalysisReport from "./components/analysis/Gpt4oAnalysisReport";
import PersonalCenter from "./pages/PersonalCenter";
import "./styles/print.css";
import { setPremiumStatus, clearPremiumStatus } from "./store/userSlice";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";
import axios from "axios";
import { fetchAndSetSubscriptionStatus } from "./store/userActions";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("/api/payment/get-subscription-status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          dispatch(setPremiumStatus(res.data));
          localStorage.setItem("userState", JSON.stringify(res.data));
        })
        .catch(() => {
          dispatch(clearPremiumStatus());
        });
    } else {
      dispatch(clearPremiumStatus());
    }
  }, [dispatch]);

  useEffect(() => {
    // 登录后或页面刷新后拉取
    if (localStorage.getItem("token")) {
      dispatch(fetchAndSetSubscriptionStatus());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Dashboard />} />

          {/* 受保护路由 */}
          <Route
            path="/personal-center"
            element={
              <ProtectedRoute>
                <PersonalCenter />
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
            path="/analysis/gemini/:id"
            element={
              <ProtectedRoute>
                <GeminiAnalysisReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/gpt4o/:id"
            element={
              <ProtectedRoute>
                <Gpt4oAnalysisReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/cancel"
            element={
              <ProtectedRoute>
                <PaymentCancel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
