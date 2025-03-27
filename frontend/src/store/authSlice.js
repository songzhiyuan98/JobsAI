import { createSlice } from "@reduxjs/toolkit";

// 从localStorage获取初始状态
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const initialState = {
  user,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 开始认证请求
    authRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 认证成功
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    // 认证失败
    authFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // 更新用户信息
    setUser: (state, action) => {
      state.user = action.payload;
    },
    // 登出
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    // 用于处理OAuth回调（保留兼容性）
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  authRequest,
  authSuccess,
  authFail,
  setUser,
  logout,
  setCredentials,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
