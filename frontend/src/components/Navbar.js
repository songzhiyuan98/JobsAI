"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as authLogout } from "../store/authSlice";
import { FiUser, FiLogIn, FiZap } from "react-icons/fi";
import authService from "../services/authService";
import { Menu, X } from "lucide-react";
import axios from "axios";
import { logout } from "../store/userActions";
import { setSubscriptionStatus } from "../store/userSlice";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { subscriptionStatus } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const response = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(response.data.data);
          // 更新会员状态
          if (response.data.data.subscriptionStatus) {
            dispatch(
              setSubscriptionStatus(response.data.data.subscriptionStatus)
            );
          }
        } catch (err) {
          setError("获取用户信息失败");
          console.error("获取用户信息错误:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, dispatch]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserData(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userState");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavToSection = (sectionId) => {
    if (window.location.pathname === "/") {
      // 在首页，直接滚动
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // 不在首页，跳转到首页并带hash
      navigate(`/#${sectionId}`);
      // 跳转后首页可用useEffect监听location.hash自动滚动
    }
  };

  const getSubscriptionBadge = () => {
    if (!isAuthenticated) return null;
    switch (subscriptionStatus) {
      case "premium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            会员版
          </span>
        );
      case "enterprise":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            企业版
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            免费版
          </span>
        );
    }
  };

  // 如果正在加载，显示一个占位符
  if (loading) {
    return (
      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent ml-4">
                  TalentSync
                </span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <button
                  onClick={() => handleNavToSection("features")}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
                >
                  Features
                </button>
                <button
                  onClick={() => handleNavToSection("pricing")}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
                >
                  Pricing
                </button>
                <button
                  onClick={() => handleNavToSection("testimonials")}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
                >
                  Testimonials
                </button>
                <button
                  onClick={() => handleNavToSection("about")}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
                >
                  About
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent ml-4">
                TalentSync
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <button
                onClick={() => handleNavToSection("features")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
              >
                Features
              </button>
              <button
                onClick={() => handleNavToSection("pricing")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavToSection("testimonials")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
              >
                Testimonials
              </button>
              <button
                onClick={() => handleNavToSection("about")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-bold bg-transparent"
              >
                About
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {getSubscriptionBadge()}
            {isAuthenticated && userData ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-lg font-bold overflow-hidden">
                    {userData?.googleProfile?.picture ? (
                      <img
                        src={userData.googleProfile.picture}
                        alt="avatar"
                        className="h-10 w-10 object-cover rounded-lg"
                      />
                    ) : (
                      userData?.name?.charAt(0)
                    )}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-bold">{user?.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {userData?.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/personal-center");
                      }}
                      className="block w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
                    >
                      个人中心
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white h-9 px-4 py-2"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="#features"
              className="block px-3 py-2 rounded-md text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="#pricing"
              className="block px-3 py-2 rounded-md text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="#testimonials"
              className="block px-3 py-2 rounded-md text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              to="#about"
              className="block px-3 py-2 rounded-md text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5 space-x-3">
              {getSubscriptionBadge()}
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/login");
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/register");
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white h-9 px-4 py-2 w-full"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
