"use client";

import { ArrowRight } from "lucide-react";
export default function HeroSection() {
  // ...直接复制你原来的HeroSection内容...
  return (
    <section className="w-full py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 text-sm font-bold text-gray-700 bg-gray-100 rounded-full mb-6">
              人才与岗位"同步匹配"
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6 leading-[1.15]">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                TalentSync
              </span>
            </h1>
            <p className="text-lg font-medium text-gray-600 mb-8 max-w-lg opacity-90">
              TalentSync帮助求职者精准匹配职位需求，提高求职成功率，让您的职业发展与理想岗位同步。
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700 font-medium">
                <span className="mr-3 text-xl">🚀</span>
                <span>智能匹配职位需求，提高求职成功率</span>
              </li>
              <li className="flex items-center text-gray-700 font-medium">
                <span className="mr-3 text-xl">✍️</span>
                <span>免费生成个性化求职信，告别模板化内容</span>
              </li>
              <li className="flex items-center text-gray-700 font-medium">
                <span className="mr-3 text-xl">🔍</span>
                <span>深度解析简历优势与优化建议</span>
              </li>
              <li className="flex items-center text-gray-700 font-medium">
                <span className="mr-3 text-xl">🎯</span>
                <span>已有超 10,000+ 用户成功获得心仪职位</span>
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="inline-flex items-center justify-center rounded-md text-base font-extrabold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-md"
                onClick={() => {
                  const el = document.getElementById("start");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.hash = "#start";
                  }
                }}
              >
                免费开始
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-base font-extrabold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-md">
                了解更多
              </button>
            </div>
            <div className="mt-10">
              <p className="text-gray-600 font-medium">
                已有超过10,000+用户成功获得心仪职位
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-sm">
              <svg
                viewBox="0 0 400 300"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                <rect
                  x="50"
                  y="50"
                  width="300"
                  height="200"
                  rx="10"
                  fill="#f9fafb"
                />
                <circle cx="200" cy="120" r="50" fill="#f3f4f6" />
                <rect
                  x="100"
                  y="190"
                  width="200"
                  height="10"
                  rx="5"
                  fill="#e5e7eb"
                />
                <rect
                  x="130"
                  y="210"
                  width="140"
                  height="10"
                  rx="5"
                  fill="#e5e7eb"
                />
                <path d="M200,120 L230,150 L170,150 Z" fill="#d1d5db" />
                <circle cx="200" cy="100" r="10" fill="#d1d5db" />
                <g opacity="0.7">
                  <circle cx="150" cy="80" r="3" fill="#9ca3af" />
                  <circle cx="160" cy="85" r="2" fill="#9ca3af" />
                  <circle cx="170" cy="75" r="4" fill="#9ca3af" />
                  <circle cx="230" cy="85" r="3" fill="#9ca3af" />
                  <circle cx="240" cy="75" r="2" fill="#9ca3af" />
                  <circle cx="250" cy="80" r="4" fill="#9ca3af" />
                </g>
                <g>
                  <line
                    x1="70"
                    y1="170"
                    x2="90"
                    y2="170"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <line
                    x1="75"
                    y1="175"
                    x2="85"
                    y2="175"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <line
                    x1="310"
                    y1="170"
                    x2="330"
                    y2="170"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <line
                    x1="315"
                    y1="175"
                    x2="325"
                    y2="175"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                </g>
                <text
                  x="200"
                  y="260"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                >
                  AI 正在分析中...
                </text>
              </svg>
              <div className="absolute bottom-6 right-6 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">AI 实时分析</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
