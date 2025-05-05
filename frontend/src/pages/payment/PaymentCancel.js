import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">
            支付已取消
          </h3>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            您已取消支付，未完成购买。
            <br />
            您可以稍后重新尝试。
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 rounded-lg text-base font-medium text-white bg-black hover:bg-gray-900 transition-colors duration-200"
            >
              返回仪表盘
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
