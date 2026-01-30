/**
 * RecommendationSkeleton Component
 *
 * Displays animated skeleton cards while recommendations are loading.
 * Uses shimmer effect with CSS animation.
 */
export function RecommendationSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-lg border border-default"
        >
          {/* Image placeholder */}
          <div className="aspect-square w-full skeleton-shimmer" />

          {/* Text placeholders */}
          <div className="space-y-1.5 px-2 pt-2 pb-1.5">
            <div className="h-3 w-3/4 rounded skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
          </div>

          {/* Button placeholder */}
          <div className="px-2 pb-2">
            <div className="h-6 w-full rounded-full skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
