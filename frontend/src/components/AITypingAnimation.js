import React, { useState, useEffect } from "react";

const AITypingAnimation = ({
  messages = ["分析中...", "处理数据...", "生成结果..."],
  speed = 80,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timer;

    if (isTyping) {
      // 打字状态
      if (charIndex < messages[messageIndex].length) {
        // 继续当前消息的打字
        timer = setTimeout(() => {
          setDisplayedText(
            (prev) => prev + messages[messageIndex].charAt(charIndex)
          );
          setCharIndex(charIndex + 1);
        }, speed);
      } else {
        // 当前消息打字完成，等待一段时间
        timer = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // 删除状态
      if (charIndex > 0) {
        // 逐字删除文本
        timer = setTimeout(() => {
          setDisplayedText((prev) => prev.substring(0, prev.length - 1));
          setCharIndex(charIndex - 1);
        }, speed / 2);
      } else {
        // 所有文本已删除，开始下一条消息
        setMessageIndex((messageIndex + 1) % messages.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isTyping, messageIndex, messages, speed]);

  return (
    <div className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
      <span>{displayedText}</span>
      <span className="inline-block w-2 h-5 ml-1 bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
    </div>
  );
};

export default AITypingAnimation;
