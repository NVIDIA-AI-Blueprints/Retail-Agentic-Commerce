"use client";

import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Simple chat bubble - user messages are green, system messages are gray
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end pr-4" : "justify-start pl-4"}`}>
      <div
        style={{
          backgroundColor: isUser ? "#76b900" : "#2a2a2a",
          color: isUser ? "#000000" : "#ffffff",
          padding: "14px 24px",
          borderRadius: "24px",
          maxWidth: "85%",
          fontSize: "16px",
          lineHeight: "1.5",
        }}
        role="article"
        aria-label={`${message.role} message`}
      >
        {message.content}
      </div>
    </div>
  );
}
