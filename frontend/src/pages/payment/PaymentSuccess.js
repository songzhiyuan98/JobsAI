import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchSubscriptionStatus } from "../../store/userActions";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // 获取最新的订阅状态
    dispatch(fetchSubscriptionStatus());

    // 3秒后跳转到个人中心
    const timer = setTimeout(() => {
      navigate("/personal-center");
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">支付成功！</h2>
          <p className="text-gray-600">
            您的订阅已成功激活，3秒后将自动跳转到个人中心...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
