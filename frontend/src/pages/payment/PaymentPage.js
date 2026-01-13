import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ============================================================
// 临时禁用支付功能 - 测试运营版
// 要恢复支付功能，将此值改为 false
// ============================================================
const DISABLE_PAYMENT = true;

const PLAN_CONFIG = {
  premium: {
    title: "专业版",
    price: "$5.99",
    desc: "适合积极求职的专业人士",
    features: [
      "无限次简历分析",
      "每日不限次求职信生成",
      "专业版HR和技术官视角分析（细节+建议）",
      "解锁所有高级模型（GPT-4o / Claude 3）",
    ],
  },
  enterprise: {
    title: "企业版",
    price: "$49.99",
    desc: "适合企业HR和招聘团队",
    features: [
      "批量简历和JD上传与分析",
      "高级筛选与多维度排序",
      "团队协作与权限管理",
      "数据导出与可视化报告",
      "API接入与系统集成",
    ],
  },
};

export default function PaymentConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const plan = searchParams.get("plan") || "premium";
  const [loading, setLoading] = useState(false);

  const planInfo = useMemo(
    () => PLAN_CONFIG[plan] || PLAN_CONFIG.premium,
    [plan]
  );

  // 如果支付功能禁用，显示提示页面
  if (DISABLE_PAYMENT) {
    return (
      <section className="w-full min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full">
              <svg
                className="w-10 h-10 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center">
              支付功能暂未开放
            </h2>
            <div className="mb-6 text-gray-600 text-center leading-relaxed">
              <p className="mb-3">
                Stripe 支付功能暂时禁用。
              </p>
              <p className="mb-3">
                当前为 <span className="font-semibold text-orange-500">测试运营版</span>，
                <span className="font-semibold">所有功能免费开放</span>给所有用户测试体验！
              </p>
              <p className="text-sm text-gray-500">
                欢迎反馈问题和建议到：
                <br />
                <a
                  href="mailto:songzhiyuan98@gmail.com"
                  className="text-blue-500 hover:underline font-medium"
                >
                  songzhiyuan98@gmail.com
                </a>
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-black text-white font-medium py-2.5 rounded-lg shadow hover:bg-gray-900 transition"
            >
              返回首页
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/payment/create-checkout-session",
        { subscriptionType: plan },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      window.location.href = res.data.url;
    } catch (e) {
      console.error("支付失败:", e);
      alert("拉起支付失败：" + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
        <h2 className="text-2xl font-bold mb-4 text-center">
          确认购买 {planInfo.title}
        </h2>
        <div className="mb-4 text-center text-gray-500">{planInfo.desc}</div>
        <div className="text-3xl font-bold mb-4 text-center">
          {planInfo.price} <span className="text-base text-gray-500">/月</span>
        </div>
        <ul className="text-gray-700 text-base mb-6 space-y-3">
          {planInfo.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          className="w-full py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-900 transition disabled:opacity-50 flex items-center justify-center"
          disabled={loading}
          onClick={handlePay}
        >
          {loading ? (
            <>
              <span className="mr-2">跳转中</span>
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            </>
          ) : (
            `确认支付${planInfo.title}`
          )}
        </button>
        <div className="text-gray-400 text-xs text-center mt-6">
          支付页面由 Stripe 提供安全托管，支持主流信用卡/借记卡。
        </div>
      </div>
    </section>
  );
}
