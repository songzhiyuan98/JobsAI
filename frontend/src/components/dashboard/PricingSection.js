import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { setSubscriptionStatus } from "../../store/userSlice";

// ============================================================
// 临时禁用支付功能 - 测试运营版
// 要恢复支付功能，将此值改为 false
// ============================================================
const DISABLE_PAYMENT = true;

// Pricing Section Component
export default function PricingSection() {
  const navigate = useNavigate();
  const { subscriptionStatus } = useSelector((state) => state.user);
  const [showCancel, setShowCancel] = useState(false);
  const [showPaymentDisabled, setShowPaymentDisabled] = useState(false);
  const dispatch = useDispatch();

  const handleCancel = async () => {
    try {
      const res = await axios.post(
        "/api/payment/cancel-subscription",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // 重新拉取会员状态，并更新到期时间
      dispatch(setSubscriptionStatus("free"));
      setShowCancel(false);
      // 你也可以弹出提示
    } catch (e) {
      alert("取消失败：" + (e.response?.data?.message || e.message));
    }
  };

  return (
    <section
      id="pricing"
      className="w-full py-20 px-4 md:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">选择适合您的计划</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            我们提供多种灵活的价格方案，满足不同阶段求职者的需求
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div
            className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col relative ${
              subscriptionStatus === "free"
                ? "before:content-[''] before:absolute before:-inset-[2px] before:bg-gradient-to-r before:from-orange-500 before:via-orange-400 before:to-orange-500 before:animate-[gradient_3s_linear_infinite] before:rounded-xl before:-z-10"
                : ""
            }`}
          >
            {subscriptionStatus === "free" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow">
                当前计划
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">免费版</h3>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-lg text-gray-500 font-normal">/月</span>
            </div>
            <p className="text-gray-600 mb-6">适合初次尝试的求职者</p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">无限次免费智能简历分析</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">无限次免费求职信生成</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  每日体验 GPT-4o 智能简历优化
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  每日体验 GPT-4o 个性化求职信
                </span>
              </li>
            </ul>

            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-auto"
              disabled={subscriptionStatus === "free"}
            >
              {subscriptionStatus === "free" ? "当前计划" : "开始使用"}
            </button>
          </div>

          {/* Pro Plan */}
          <div
            className={`bg-white p-8 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg flex flex-col relative ${
              subscriptionStatus === "premium"
                ? "before:content-[''] before:absolute before:-inset-[2px] before:bg-gradient-to-r before:from-orange-500 before:via-orange-400 before:to-orange-500 before:animate-[gradient_3s_linear_infinite] before:rounded-xl before:-z-10"
                : ""
            }`}
          >
            <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              最受欢迎
            </div>
            {subscriptionStatus === "premium" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow">
                当前计划
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">专业版</h3>
            <div className="text-4xl font-bold mb-6">
              $5.99
              <span className="text-lg text-gray-500 font-normal">/月</span>
            </div>
            <p className="text-gray-600 mb-6">适合积极求职的专业人士</p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">免费版所有基础功能</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  无限次 GPT-4o 智能简历优化与建议
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  无限次 GPT-4o 个性化求职信定制
                </span>
              </li>
            </ul>

            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white h-10 px-4 py-2 mt-auto"
              onClick={
                subscriptionStatus === "premium"
                  ? () => setShowCancel(true)
                  : subscriptionStatus === "enterprise"
                  ? undefined
                  : () => {
                      if (DISABLE_PAYMENT) {
                        setShowPaymentDisabled(true);
                      } else {
                        navigate("/payment?plan=premium");
                      }
                    }
              }
              disabled={subscriptionStatus === "enterprise"}
            >
              {subscriptionStatus === "premium"
                ? "取消订阅"
                : subscriptionStatus === "enterprise"
                ? "已开通企业版"
                : "立即升级"}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div
            className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col relative ${
              subscriptionStatus === "enterprise"
                ? "before:content-[''] before:absolute before:-inset-[2px] before:bg-gradient-to-r before:from-orange-500 before:via-orange-400 before:to-orange-500 before:animate-[gradient_3s_linear_infinite] before:rounded-xl before:-z-10"
                : ""
            }`}
          >
            {subscriptionStatus === "enterprise" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow">
                当前计划
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">企业版</h3>
            <div className="text-4xl font-bold mb-6">
              $49.99
              <span className="text-lg text-gray-500 font-normal">/月</span>
            </div>
            <p className="text-gray-600 mb-6">适合企业HR和招聘团队</p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">专业版全部高级功能</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  批量简历智能分析（支持100份/次）
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  批量求职信智能生成（支持50份/次）
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  企业级团队协作与权限管理系统
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  专业候选人评估与人才分析报告
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  专属客户成功经理一对一服务
                </span>
              </li>
            </ul>

            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-auto"
              onClick={
                subscriptionStatus === "enterprise"
                  ? () => setShowCancel(true)
                  : () => {
                      if (DISABLE_PAYMENT) {
                        setShowPaymentDisabled(true);
                      } else {
                        navigate("/payment?plan=enterprise");
                      }
                    }
              }
              disabled={false}
            >
              {subscriptionStatus === "enterprise" ? "取消订阅" : "联系销售"}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            所有计划均可随时取消。需要更多定制化服务？
            <a href="#" className="text-black font-medium">
              联系我们
            </a>
          </p>
        </div>
      </div>

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="mb-3 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-gray-400"
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
                <span className="text-xl font-semibold text-black">
                  取消订阅确认
                </span>
              </div>
              <div className="mb-6 text-gray-600 text-center">
                你确定要取消当前会员订阅吗？
                <br />
                取消后将立即失去会员权益。
              </div>
              <div className="flex gap-4 w-full mt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-black text-white font-medium py-2 rounded-lg shadow hover:bg-gray-900 transition"
                >
                  确认取消
                </button>
                <button
                  onClick={() => setShowCancel(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 支付功能暂时禁用弹窗 */}
      {showPaymentDisabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
                <svg
                  className="w-8 h-8 text-orange-500"
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
              <span className="text-xl font-semibold text-black mb-3">
                支付功能暂未开放
              </span>
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
                onClick={() => setShowPaymentDisabled(false)}
                className="w-full bg-black text-white font-medium py-2.5 rounded-lg shadow hover:bg-gray-900 transition"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
