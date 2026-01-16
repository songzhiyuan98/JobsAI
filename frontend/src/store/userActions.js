import axios from "axios";
import {
  setSubscriptionStatus,
  clearUserState,
} from "./userSlice";
import { logout as authLogout } from "./authSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

// 设置 axios 默认配置
const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = API_URL;

// 登出函数
export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  dispatch(authLogout());
  dispatch(clearUserState());
};

// 获取用户订阅状态
export const fetchSubscriptionStatus = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      dispatch(setSubscriptionStatus(response.data.data.subscriptionStatus));
      localStorage.setItem(
        "userState",
        JSON.stringify({
          subscriptionStatus: response.data.data.subscriptionStatus,
        })
      );
    }
  } catch (error) {
    console.error("获取订阅状态失败:", error);
    if (error.response?.status === 401) {
      dispatch(logout());
    }
  }
};

// 获取使用情况
export const fetchUserUsage = createAsyncThunk(
  "user/fetchUsage",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      // 使用 /api/auth/me 获取用户信息，包含使用情况
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      console.error("获取使用情况失败:", error);
      return rejectWithValue(
        error.response?.data?.message || "获取使用情况失败"
      );
    }
  }
);

// 检查功能权限
export const checkFeaturePermission = createAsyncThunk(
  "user/checkFeaturePermission",
  async ({ feature }, { getState }) => {
    const state = getState();
    const { subscriptionStatus } = state.user;

    // 根据订阅状态检查权限
    if (
      subscriptionStatus === "premium" ||
      subscriptionStatus === "enterprise"
    ) {
      return true; // 高级用户无限制
    }

    // 免费用户限制
    const usageLimit = {
      analysis: 1,
      coverLetter: 1,
    };

    // 获取用户使用情况
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { dailyUsage, lastUsageDate } = response.data.data;
      const today = new Date().toISOString().split("T")[0];

      // 如果是新的一天，重置使用次数
      if (lastUsageDate !== today) {
        return true;
      }

      // 检查是否超过限制
      return dailyUsage[feature] < usageLimit[feature];
    } catch (error) {
      console.error("检查权限失败:", error);
      return false;
    }
  }
);
