import { AnimatePresence, motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

// 不同类型的 step 文案
const stepTextMap = {
  analysis: [
    "",
    "正在使用 Gemini 2.0 Flash 解析简历...",
    "正在使用 Gemini 2.0 Flash 解析职位描述...",
    "正在使用 {model} 进行智能匹配分析...",
  ],
  coverletter: [
    "",
    "正在使用 Gemini 2.0 Flash 解析简历...",
    "正在使用 Gemini 2.0 Flash 解析职位描述...",
    "正在使用 {model} 生成求职信...",
  ],
};

export default function LoadingMaskAI({
  step = 1,
  analysisLines = [],
  currentLine = 0,
  type = "analysis",
  model = "Gemini 2.0 Flash",
}) {
  // 选择类型对应的 step 文案
  const stepText = stepTextMap[type] || stepTextMap.analysis;
  const mainText = (stepText[step] || "AI智能处理中...").replace(
    "{model}",
    model
  );
  // 求职信生成时，analysisLines 通常为空，直接用 mainText
  const descText =
    step === 3 && analysisLines.length > 0 && analysisLines[currentLine]
      ? analysisLines[currentLine]
      : "";

  return (
    <AnimatePresence>
      <motion.div
        key="ai-loading-mask"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
        style={{ backdropFilter: "blur(8px)" }}
      >
        {/* 背景粒子效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* AI 核心动画区域 */}
        <div className="relative mb-12">
          {/* 外圈光环 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
            }}
          />

          {/* 中圈脉冲 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)",
            }}
          />

          {/* 核心图标 */}
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="relative"
              animate={{
                filter: [
                  "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
                  "drop-shadow(0 0 16px rgba(255,255,255,0.9))",
                  "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Brain className="h-16 w-16 text-white" />
            </motion.div>
          </motion.div>

          {/* 数据流动画 */}
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* 装饰性光点 */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${25 + i * 16.67}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
          ))}
        </div>

        {/* 大标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-extrabold text-2xl text-white mb-4 tracking-wide text-center drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)] min-h-[32px]"
        >
          {mainText}
        </motion.div>

        {/* step 3 动态一行信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-8 flex items-center justify-center w-full mb-8 min-h-[32px]"
        >
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
        </motion.div>

        {/* 进度条 */}
        <div className="w-2/3 h-1.5 rounded-full overflow-hidden mt-4 shadow-lg bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-white/80 to-white"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              boxShadow: "0 0 20px rgba(255,255,255,0.5)",
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
