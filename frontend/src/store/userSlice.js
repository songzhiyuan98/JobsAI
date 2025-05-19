import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subscriptionStatus: null,
  dailyUsage: {
    analysis: 0,
    coverLetter: 0,
  },
  lastUsageDate: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSubscriptionStatus: (state, action) => {
      state.subscriptionStatus = action.payload;
    },
    setDailyUsage: (state, action) => {
      state.dailyUsage = action.payload;
    },
    setLastUsageDate: (state, action) => {
      state.lastUsageDate = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearUserState: (state) => {
      state.subscriptionStatus = null;
      state.dailyUsage = {
        analysis: 0,
        coverLetter: 0,
      };
      state.lastUsageDate = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSubscriptionStatus,
  setDailyUsage,
  setLastUsageDate,
  setLoading,
  setError,
  clearUserState,
} = userSlice.actions;

export default userSlice.reducer;
