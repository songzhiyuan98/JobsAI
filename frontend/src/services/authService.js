import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// 设置请求头中的令牌
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// 登录
const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setAuthToken(response.data.token);
  }

  return response.data;
};

// 注册
const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, {
    name,
    email,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setAuthToken(response.data.token);
  }

  return response.data;
};

// 获取当前用户
const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("无认证令牌");
  }

  setAuthToken(token);
  const response = await axios.get(`${API_URL}/api/auth/me`);
  return response.data;
};

// 注销
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setAuthToken(null);
};

const authService = {
  login,
  register,
  getCurrentUser,
  logout,
  setAuthToken,
};

export default authService;
