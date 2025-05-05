import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";

const stepText = [
  "",
  "正在解析简历...",
  "正在解析职位描述...",
  "正在智能匹配分析...",
];

export default function LoadingMaskAI({
  step = 1,
  analysisLines = [],
  currentLine = 0,
}) {
  // 直接显示文本，无打字机动画
  const mainText = stepText[step];
  const descText =
    step === 3 && analysisLines[currentLine] ? analysisLines[currentLine] : "";

  return (
    <AnimatePresence>
      <motion.div
        key="ai-loading-mask"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
        style={{ backdropFilter: "blur(3px)" }}
      >
        {/* AI图标（白色发光呼吸动画） */}
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            filter: [
              "drop-shadow(0 0 8px #fff)",
              "drop-shadow(0 0 16px #fff)",
              "drop-shadow(0 0 8px #fff)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <Brain className="h-16 w-16 text-white" />
        </motion.div>
        {/* 大标题 */}
        <div className="font-extrabold text-2xl text-white mb-4 tracking-wide text-center drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)] min-h-[32px]">
          {mainText}
        </div>
        {/* step 3 动态一行信息（普通小字，灰色，不发光） */}
        <div className="h-8 flex items-center justify-center w-full mb-8 min-h-[32px]">
          {step === 3 && descText ? (
            <div
              className="text-base font-medium text-center text-gray-300 w-full max-w-2xl mx-auto px-2"
              style={{ minHeight: 32 }}
            >
              {descText}
            </div>
          ) : (
            <div style={{ minHeight: 32 }}></div>
          )}
        </div>
        {/* Linear 进度条（白色，速度70） */}
        <div className="w-2/3 h-2 rounded-full overflow-hidden mt-4 shadow-lg bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white shadow-[0_0_16px_2px_rgba(255,255,255,0.7)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
