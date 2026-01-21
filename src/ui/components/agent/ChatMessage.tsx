"use client";

import { Flex, Text } from "@kui/foundations-react-external";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Chat message bubble component for agent/user messages
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <Flex justify="center" className="w-full">
      <div
        className={cn(
          "rounded-3xl px-8 py-3",
          isUser
            ? "bg-[#76b900] text-white"
            : "bg-surface-raised text-primary border border-base"
        )}
        role="article"
        aria-label={`${message.role} message`}
      >
        <Text kind="body/regular/md">{message.content}</Text>
      </div>
    </Flex>
  );
}
