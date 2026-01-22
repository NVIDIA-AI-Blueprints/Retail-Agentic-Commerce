"use client";

import { useEffect, useRef } from "react";
import { Stack, Text, Badge, Flex } from "@kui/foundations-react-external";
import { useAgentActivityLog } from "@/hooks/useAgentActivityLog";
import { AgentActivityItem } from "./AgentActivityItem";

/**
 * Empty state with visual placeholder
 */
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Stack gap="3" align="center" className="max-w-xs text-center">
        {/* Subtle icon placeholder */}
        <div className="w-12 h-12 rounded-xl bg-[#242424] border border-[#333333] flex items-center justify-center mb-2">
          <svg
            className="w-6 h-6 text-subtle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <Text kind="label/semibold/md" className="text-secondary">
          No agent activity
        </Text>
        <Text kind="body/regular/sm" className="text-subtle">
          Agent decisions will appear here when products are added to checkout.
        </Text>
      </Stack>
    </div>
  );
}

/**
 * Active session view with agent activity timeline
 */
function ActiveAgentActivity() {
  const { state } = useAgentActivityLog();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.events.length]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Session header */}
      <div
        className="border-b border-[#333333] bg-[#1a1a1a]"
        style={{ padding: "32px 32px 16px 32px", marginTop: "16px" }}
      >
        <Flex justify="between" align="center">
          <Text kind="label/semibold/md" className="text-secondary">
            Agent Decisions
          </Text>
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <Text kind="body/regular/sm" className="text-subtle">
              {state.events.length} decision{state.events.length !== 1 ? "s" : ""}
            </Text>
          </Flex>
        </Flex>
      </div>

      {/* Event timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pl-8 bg-[#171717]">
        <Stack gap="0">
          {state.events.map((event, index) => (
            <AgentActivityItem
              key={event.id}
              event={event}
              isLast={index === state.events.length - 1}
            />
          ))}
        </Stack>
      </div>

      {/* Footer with legend */}
      <div
        className="border-t border-[#333333] bg-[#1a1a1a]"
        style={{ padding: "16px 32px 16px 48px" }}
      >
        <Flex gap="6" wrap="wrap">
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <Text kind="body/regular/sm" className="text-subtle whitespace-nowrap">
              Promotion
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <Text kind="body/regular/sm" className="text-subtle whitespace-nowrap">
              Discount Applied
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-500 flex-shrink-0" />
            <Text kind="body/regular/sm" className="text-subtle whitespace-nowrap">
              No Promo
            </Text>
          </Flex>
        </Flex>
      </div>
    </div>
  );
}

/**
 * Agent Activity Panel - displays agent decisions and reasoning
 * This panel sits next to the Merchant Server panel without a divider
 */
export function AgentActivityPanel() {
  const { state } = useAgentActivityLog();

  return (
    <section
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e1e1e] border border-[#333333] rounded-2xl"
      aria-label="Agent Activity Panel"
    >
      {/* Clean header with badge */}
      <div className="px-6 pt-5 pb-6 border-b border-[#333333]">
        <Badge kind="solid" color="green">
          Agent Activity
        </Badge>
      </div>

      {/* Content - either empty state or active session */}
      {state.events.length === 0 ? <EmptyState /> : <ActiveAgentActivity />}
    </section>
  );
}
