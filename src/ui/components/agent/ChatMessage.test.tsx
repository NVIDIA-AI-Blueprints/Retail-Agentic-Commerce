import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types";

describe("ChatMessage", () => {
  const userMessage: ChatMessageType = {
    id: "msg_1",
    role: "user",
    content: "Hello, I need help!",
    timestamp: new Date().toISOString(),
  };

  const agentMessage: ChatMessageType = {
    id: "msg_2",
    role: "agent",
    content: "How can I assist you?",
    timestamp: new Date().toISOString(),
  };

  it("renders user message content", () => {
    render(<ChatMessage message={userMessage} />);
    expect(screen.getByText("Hello, I need help!")).toBeInTheDocument();
  });

  it("renders agent message content", () => {
    render(<ChatMessage message={agentMessage} />);
    expect(screen.getByText("How can I assist you?")).toBeInTheDocument();
  });

  it("has correct aria-label for user message", () => {
    render(<ChatMessage message={userMessage} />);
    const article = screen.getByRole("article");
    expect(article).toHaveAttribute("aria-label", "user message");
  });

  it("has correct aria-label for agent message", () => {
    render(<ChatMessage message={agentMessage} />);
    const article = screen.getByRole("article");
    expect(article).toHaveAttribute("aria-label", "agent message");
  });
});
