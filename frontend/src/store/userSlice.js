import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPremium: false,
  isEnterprise: false,
  subscriptionEndDate: null,
  subscriptionType: "free", // free, premium, enterprise
  features: {
    gpt3_5: false,
    gpt4o: false,
    claude: false,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setPremiumStatus: (state, action) => {
      state.isPremium = action.payload.isPremium;
      state.isEnterprise = action.payload.isEnterprise;
      state.subscriptionEndDate = action.payload.subscriptionEndDate;
      state.subscriptionType = action.payload.subscriptionType;
      state.features = action.payload.features;
      localStorage.setItem("userState", JSON.stringify(state));
    },
    clearPremiumStatus: (state) => {
      state.isPremium = false;
      state.isEnterprise = false;
      state.subscriptionEndDate = null;
      state.subscriptionType = "free";
      state.features = {
        gpt3_5: false,
        gpt4o: false,
        claude: false,
      };
      localStorage.removeItem("userState");
    },
  },
});

export const { setPremiumStatus, clearPremiumStatus } = userSlice.actions;
export default userSlice.reducer;
