"use client";

/**
 * Subtle vertical divider between panels
 * Clean, minimal design that doesn't distract from content
 */
export function PanelDivider() {
  return (
    <div className="relative flex flex-col items-center justify-center w-6 py-8 shrink-0">
      {/* Subtle vertical line */}
      <div className="absolute inset-y-8 w-px bg-[#333]" />

      {/* Center indicator - subtle dot */}
      <div className="relative z-10 w-2 h-2 rounded-full bg-brand" />
    </div>
  );
}
