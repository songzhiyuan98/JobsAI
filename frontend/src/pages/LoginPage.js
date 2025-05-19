import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { authRequest, authSuccess, authFail } from "../store/authSlice";
import authService from "../services/authService";
import logo from "../assets/logo.svg";
import { FcGoogle } from "react-icons/fc";
import { setSubscriptionStatus } from "../store/userSlice";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    dispatch(authRequest());
    try {
      const data = await authService.login(email, password);
      dispatch(authSuccess({ user: data.user, token: data.token }));
      localStorage.setItem("token", data.token);
      dispatch(setSubscriptionStatus("free"));
      localStorage.setItem("userState", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "登录失败，请检查您的凭据后重试。";
      setError(errorMessage);
      dispatch(authFail(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* 左侧插画 */}
      <div className="hidden md:flex w-1/2 items-start justify-center bg-white">
        <div className="max-w-2xl w-full px-0 flex flex-col items-start justify-start h-full pt-24">
          {/* 广告语标题 */}
          <div className="mb-4 w-full text-center">
            <h1 className="text-4xl font-bold text-black tracking-tight">
              欢迎回来，开启下一次求职之旅
            </h1>
          </div>
          {/* SVG 插画 */}
          <div className="relative w-full flex items-center justify-center">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-white p-0 rounded-2xl shadow-none w-full flex items-center justify-center">
              <svg
                viewBox="0 0 400 300"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto max-w-2xl"
                style={{ minHeight: "360px" }}
              >
                <rect
                  x="50"
                  y="50"
                  width="300"
                  height="200"
                  rx="10"
                  fill="#f9fafb"
                />
                <circle cx="200" cy="120" r="50" fill="#f3f4f6" />
                <rect
                  x="100"
                  y="190"
                  width="200"
                  height="10"
                  rx="5"
                  fill="#e5e7eb"
                />
                <rect
                  x="130"
                  y="210"
                  width="140"
                  height="10"
                  rx="5"
                  fill="#e5e7eb"
                />
                <path d="M200,120 L230,150 L170,150 Z" fill="#d1d5db" />
                <circle cx="200" cy="100" r="10" fill="#d1d5db" />
                <g opacity="0.7">
                  <circle cx="150" cy="80" r="3" fill="#9ca3af" />
                  <circle cx="160" cy="85" r="2" fill="#9ca3af" />
                  <circle cx="170" cy="75" r="4" fill="#9ca3af" />
                  <circle cx="230" cy="85" r="3" fill="#9ca3af" />
                  <circle cx="240" cy="75" r="2" fill="#9ca3af" />
                  <circle cx="250" cy="80" r="4" fill="#9ca3af" />
                </g>
                <g>
                  <line
                    x1="70"
                    y1="170"
                    x2="90"
                    y2="170"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <line
                    x1="75"
                    y1="175"
                    x2="85"
                    y2="175"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <line
                    x1="310"
                    y1="170"
                    x2="330"
                    y2="170"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <line
                    x1="315"
                    y1="175"
                    x2="325"
                    y2="175"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                </g>
                <text
                  x="200"
                  y="260"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                >
                  AI 正在分析中...
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* 右侧表单 */}
      <div className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full pt-15">
          <h2 className="text-center text-3xl font-extrabold text-black">
            登录您的账号
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            或{" "}
            <Link
              to="/register"
              className="font-medium text-black hover:underline"
            >
              创建新账号
            </Link>
          </p>
          <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-100">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black"
                >
                  邮箱地址
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-black rounded-md leading-5 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black"
                >
                  密码
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-black rounded-md leading-5 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-black rounded"
                  />
                  <label
                    htmlFor="remember_me"
                    className="ml-2 block text-sm text-black"
                  >
                    记住我
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-black hover:underline"
                  >
                    忘记密码?
                  </Link>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "登录中..." : "登录"}
                </button>
              </div>
            </form>
            <div className="mt-6">
              <button
                onClick={() => {
                  window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
                }}
                type="button"
                className="w-full flex items-center justify-center px-4 py-2 border border-black rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-100 transition"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                使用 Google 登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
