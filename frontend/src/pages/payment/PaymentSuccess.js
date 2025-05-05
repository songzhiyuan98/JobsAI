import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setPremiumStatus } from "../../store/userSlice";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await axios.get(
          "/api/payment/get-subscription-status",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // 更新 Redux 中的订阅状态
        dispatch(setPremiumStatus(response.data.data));

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => navigate("/"), 2000);
      } catch (error) {
        console.error("获取订阅状态失败:", error);
        // 即使获取失败也跳转，但显示错误提示
        alert("支付成功，但获取会员状态失败，请刷新页面重试");
        navigate("/");
      }
    };

    fetchSubscriptionStatus();
  }, [navigate, dispatch]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">
            支付成功
          </h3>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            会员权益已开通
            <br />
            正在跳转到仪表盘...
          </p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
