import { useNavigate } from "react-router-dom";

export default function LoginReminderModal({ show }) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
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
            <span className="text-xl font-semibold text-black">登录提醒</span>
          </div>
          <div className="mb-6 text-gray-600 text-center">
            您需要先登录才能访问该功能。
          </div>
          <div className="flex gap-4 w-full mt-2">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 bg-black text-white font-medium py-2 rounded-lg shadow hover:bg-gray-900 transition"
            >
              去登录
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
