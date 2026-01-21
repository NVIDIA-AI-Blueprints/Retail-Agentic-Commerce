"use client";

/**
 * Animated vertical divider between panels
 * Shows bidirectional communication with horizontal arrows and animated center dot
 * Uses NVIDIA brand green (#76b900) for styling
 */
export function PanelDivider() {
  return (
    <div className="relative flex flex-col items-center justify-center w-16 py-4">
      {/* Dashed vertical line - full height */}
      <div className="absolute inset-y-4 w-px border-l-2 border-dashed border-[#76b900] opacity-50" />

      {/* Center section with arrows and dot */}
      <div className="relative flex items-center gap-1 z-10">
        {/* Left arrow (pointing to Agent) */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="#76b900"
        >
          <path d="M10 3L4 7L10 11V3Z" />
        </svg>

        {/* Animated center dot with glow */}
        <div className="w-4 h-4 rounded-full bg-[#76b900] animate-pulse shadow-[0_0_16px_6px_rgba(118,185,0,0.5)]" />

        {/* Right arrow (pointing to Merchant) */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="#76b900"
        >
          <path d="M4 3L10 7L4 11V3Z" />
        </svg>
      </div>
    </div>
  );
}
