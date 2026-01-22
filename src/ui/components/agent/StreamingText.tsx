"use client";

import { useState, useEffect, useRef } from "react";
import { Text } from "@kui/foundations-react-external";

interface StreamingTextProps {
  text: string;
  /** Speed in milliseconds per character */
  speed?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** CSS class name */
  className?: string;
}

/**
 * Streaming text component that reveals text character by character
 * Simulates an AI/LLM streaming response
 */
export function StreamingText({
  text,
  speed = 20,
  onComplete,
  className,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  // Use refs to avoid re-triggering the effect
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep the ref updated
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Don't re-run if already completed
    if (hasCompletedRef.current) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <Text kind="body/regular/md" className={className ?? ""}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-green-400 ml-0.5 animate-pulse" />
      )}
    </Text>
  );
}
