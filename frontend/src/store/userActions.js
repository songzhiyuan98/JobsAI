import axios from "axios";
import { setPremiumStatus } from "./userSlice"; // 路径按你的项目结构调整

export const fetchAndSetSubscriptionStatus = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/payment/get-subscription-status", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const sub = res.data.data;
    dispatch(
      setPremiumStatus({
        isPremium: sub?.subscriptionType === "premium",
        isEnterprise: sub?.subscriptionType === "enterprise",
        subscriptionEndDate: sub?.endDate,
        subscriptionType: sub?.subscriptionType || "free",
        features: sub?.features || {},
      })
    );
  } catch (e) {
    // 失败时降级为免费
    dispatch(
      setPremiumStatus({
        isPremium: false,
        isEnterprise: false,
        subscriptionEndDate: null,
        subscriptionType: "free",
        features: {},
      })
    );
  }
};
