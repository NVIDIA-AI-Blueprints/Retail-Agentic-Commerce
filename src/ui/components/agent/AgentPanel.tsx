"use client";

import { useState } from "react";
import { Stack, Flex, Text, Badge } from "@kui/foundations-react-external";
import { ChatMessage } from "./ChatMessage";
import { ProductCard } from "./ProductCard";
import { mockProducts, mockChatMessages } from "@/data/mock-data";
import type { ChatMessage as ChatMessageType } from "@/types";

/**
 * Left panel containing the agent chat interface and product display
 */
export function AgentPanel() {
  const [messages] = useState<ChatMessageType[]>(mockChatMessages);

  return (
    <section
      className="flex-1 flex flex-col h-full overflow-hidden bg-surface-raised rounded-lg"
      aria-label="Agent Panel"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="start"
        className="px-6 pt-6 pb-4 border-b border-base"
      >
        <Badge kind="outline" color="gray">
          Agent
        </Badge>
      </Flex>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Stack gap="6" className="p-6">
          {/* Chat message */}
          <Stack gap="3">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </Stack>

          {/* Response text */}
          <Text kind="body/regular/md" className="text-secondary">
            Here are some options to check out:
          </Text>

          {/* Product cards - 3 columns */}
          <Flex gap="4" wrap="wrap">
            {mockProducts.map((product) => (
              <div key={product.id} className="w-[200px]">
                <ProductCard product={product} />
              </div>
            ))}
          </Flex>
        </Stack>
      </div>
    </section>
  );
}
