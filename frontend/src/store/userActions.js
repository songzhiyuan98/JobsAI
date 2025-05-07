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
    if (e.response && e.response.status === 401) {
      // token 失效，自动登出
      dispatch({ type: "auth/logout" });
      // 可选：window.location.href = "/login";
    } else {
      // 其他错误不降级，弹窗提示或忽略
      // alert("网络异常，会员状态获取失败");
    }
  }
};
