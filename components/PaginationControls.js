"use client";

import { useEffect, useRef } from "react";

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 4 },
  progress: {
    display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10,
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: 13, color: "#9EB3A6", letterSpacing: 0.4, textAlign: "center",
  },
  track: { width: 110, height: 4, borderRadius: 2, backgroundColor: "#232C27", overflow: "hidden" },
  fill: (ratio) => ({
    height: "100%", width: `${Math.round(ratio * 100)}%`,
    backgroundColor: "#B2D095", borderRadius: 2, transition: "width 0.35s ease",
  }),
  sentinel: {
    width: "100%", padding: "12px 0 4px", textAlign: "center", fontSize: 12.5,
    fontStyle: "italic", color: "#6E8A7C", fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: 0.5,
  },
  done: { fontSize: 12, color: "#6E8A7C", fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: 0.6, textAlign: "center" },
};

export default function PaginationControls({ visible, total, onLoadMore }) {
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(onLoadMore);
  const hasMore = visible < total;

  useEffect(() => { loadMoreRef.current = onLoadMore; }); // Always call the latest callback.

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;
    // One batch per observer lifetime: a new `visible` count re-arms this effect.
    let fired = false;
    const observer = new IntersectionObserver((entries) => {
      if (fired || !entries.some((e) => e.isIntersecting)) return;
      fired = true;
      loadMoreRef.current();
    }, { rootMargin: "200px 0px" }); // Start a beat before the true bottom.
    observer.observe(node);
    return () => observer.disconnect(); // Cleanup on unmount or once exhausted.
  }, [hasMore, visible]);

  const ratio = total > 0 ? Math.min(1, visible / total) : 0;

  return (
    <div style={styles.wrap}>
      <div style={styles.progress}>
        <span>Showing {visible} of {total} specimens / កំពុងបង្ហាញ {visible} នៃ {total} គំរូ</span>
        <div style={styles.track}><div style={styles.fill(ratio)} /></div>
      </div>
      {hasMore ? (
        <div ref={sentinelRef} role="status" style={styles.sentinel}>
          កំពុងទាញយកគំរូបន្ថែម… / Loading more specimens…
        </div>
      ) : (
        <span style={styles.done}>All specimens shown / បានបង្ហាញរុក្ខជាតិទាំងអស់</span>
      )}
    </div>
  );
}