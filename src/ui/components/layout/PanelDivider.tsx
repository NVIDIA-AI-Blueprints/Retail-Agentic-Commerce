"use client";

/**
 * Vertical divider between panels with NVIDIA green glow
 * Extends far beyond container bounds to reach viewport edges
 * Features long gradient fades at top and bottom for seamless blending
 */
export function PanelDivider() {
  return (
    <div className="relative flex flex-col items-center justify-center w-8 shrink-0">
      {/* Main glowing line - extends well beyond container to reach viewport edges */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full"
        style={{
          top: "-100vh",
          bottom: "-100vh",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(118, 185, 0, 0.2) 35%, #76b900 45%, #76b900 55%, rgba(118, 185, 0, 0.2) 65%, transparent 100%)",
          boxShadow: "0 0 12px 2px rgba(118, 185, 0, 0.4), 0 0 24px 4px rgba(118, 185, 0, 0.2)",
        }}
      />

      {/* Soft glow backdrop for extra depth - also extended */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[8px] rounded-full opacity-25"
        style={{
          top: "-100vh",
          bottom: "-100vh",
          background:
            "linear-gradient(180deg, transparent 0%, #76b900 40%, #76b900 60%, transparent 100%)",
          filter: "blur(6px)",
        }}
      />

      {/* Center indicator - glowing dot */}
      <div
        className="relative z-10 w-3 h-3 rounded-full bg-brand"
        style={{
          boxShadow: "0 0 8px 2px rgba(118, 185, 0, 0.6), 0 0 16px 4px rgba(118, 185, 0, 0.3)",
        }}
      />
    </div>
  );
}
