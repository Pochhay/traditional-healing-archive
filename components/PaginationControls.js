"use client";

import { useState } from "react";

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
  loadMore: (hovered) => ({
    padding: "10px 26px", minHeight: 44, borderRadius: 4, cursor: "pointer",
    fontSize: 13, fontWeight: 600, fontFamily: "inherit", letterSpacing: 0.3,
    border: `1px solid ${hovered ? "#C8E6A9" : "#B2D095"}`,
    backgroundColor: hovered ? "#C8E6A9" : "#B2D095", color: "#0C1511",
    transition: "background-color 0.2s ease, border-color 0.2s ease",
  }),
  done: { fontSize: 12, color: "#6E8A7C", fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: 0.6, textAlign: "center" },
};

export default function PaginationControls({ visible, total, onLoadMore }) {
  const [hovered, setHovered] = useState(false);
  const ratio = total > 0 ? visible / total : 0;

  return (
    <div style={styles.wrap}>
      <div style={styles.progress}>
        <span>Showing {visible} of {total} specimens / កំពុងបង្ហាញ {visible} នៃ {total} គំរូ</span>
        <div style={styles.track}><div style={styles.fill(ratio)} /></div>
      </div>
      {visible < total ? (
        <button type="button" style={styles.loadMore(hovered)} onClick={onLoadMore}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          Load More / បង្ហាញបន្ថែម
        </button>
      ) : (
        <span style={styles.done}>All specimens shown / បានបង្ហាញរុក្ខជាតិទាំងអស់</span>
      )}
    </div>
  );
}