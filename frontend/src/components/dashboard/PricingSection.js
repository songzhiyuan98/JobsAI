import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { setPremiumStatus } from "../../store/userSlice";

// Pricing Section Component
export default function PricingSection() {
  const navigate = useNavigate();
  const { subscriptionType, subscriptionEndDate } = useSelector(
    (state) => state.user
  );
  const [showCancel, setShowCancel] = useState(false);
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
      dispatch(
        setPremiumStatus({
          isPremium: subscriptionType === "premium",
          isEnterprise: subscriptionType === "enterprise",
          subscriptionEndDate: res.data.periodEnd,
          subscriptionType,
          features: {},
        })
      );
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
              subscriptionType === "free"
                ? "before:content-[''] before:absolute before:-inset-[2px] before:bg-gradient-to-r before:from-orange-500 before:via-orange-400 before:to-orange-500 before:animate-[gradient_3s_linear_infinite] before:rounded-xl before:-z-10"
                : ""
            }`}
          >
            {subscriptionType === "free" && (
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
                <span className="text-gray-600">每天10次简历分析</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">每天20次求职信生成</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">基础版HR和技术官视角分析</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  使用 Gemini 2.0 Flash 模型
                </span>
              </li>
            </ul>

            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-auto"
              disabled={subscriptionType === "free"}
            >
              {subscriptionType === "free" ? "当前计划" : "开始使用"}
            </button>
          </div>

          {/* Pro Plan */}
          <div
            className={`bg-white p-8 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg flex flex-col relative ${
              subscriptionType === "premium"
                ? "before:content-[''] before:absolute before:-inset-[2px] before:bg-gradient-to-r before:from-orange-500 before:via-orange-400 before:to-orange-500 before:animate-[gradient_3s_linear_infinite] before:rounded-xl before:-z-10"
                : ""
            }`}
          >
            <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              最受欢迎
            </div>
            {subscriptionType === "premium" && (
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
                <span className="text-gray-600">无限次简历分析</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">每日不限次求职信生成</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  专业版HR和技术官视角分析（细节+建议）
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  解锁所有高级模型（GPT-4o / Claude 3）
                </span>
              </li>
            </ul>

            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white h-10 px-4 py-2 mt-auto"
              onClick={
                subscriptionType === "premium"
                  ? () => setShowCancel(true)
                  : subscriptionType === "enterprise"
                  ? undefined
                  : () => navigate("/payment?plan=premium")
              }
              disabled={subscriptionType === "enterprise"}
            >
              {subscriptionType === "premium"
                ? "取消订阅"
                : subscriptionType === "enterprise"
                ? "已开通企业版"
                : "立即升级"}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div
            className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col relative ${
              subscriptionType === "enterprise"
                ? "before:content-[''] before:absolute before:-inset-[2px] before:bg-gradient-to-r before:from-orange-500 before:via-orange-400 before:to-orange-500 before:animate-[gradient_3s_linear_infinite] before:rounded-xl before:-z-10"
                : ""
            }`}
          >
            {subscriptionType === "enterprise" && (
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
                <span className="text-gray-600">批量简历和JD上传与分析</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">高级筛选与多维度排序</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">团队协作与权限管理</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">数据导出与可视化报告</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">API接入与系统集成</span>
              </li>
            </ul>

            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-auto"
              onClick={
                subscriptionType === "enterprise"
                  ? () => setShowCancel(true)
                  : () => navigate("/payment?plan=enterprise")
              }
              disabled={false}
            >
              {subscriptionType === "enterprise" ? "取消订阅" : "联系销售"}
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
    </section>
  );
}
