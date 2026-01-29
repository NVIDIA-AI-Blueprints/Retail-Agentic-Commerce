/**
 * RecommendationSkeleton Component
 *
 * Displays animated skeleton cards while recommendations are loading.
 * Uses shimmer effect with CSS animation.
 */
export function RecommendationSkeleton() {
  return (
    <div className="flex gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="min-w-[140px] max-w-[140px] flex-shrink-0 overflow-hidden rounded-xl border border-default"
        >
          {/* Image placeholder */}
          <div className="h-[100px] w-full skeleton-shimmer" />

          {/* Text placeholders */}
          <div className="space-y-2 p-2">
            <div className="h-3 w-3/4 rounded skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
          </div>

          {/* Button placeholder */}
          <div className="px-2 pb-2">
            <div className="h-7 w-full rounded-full skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
