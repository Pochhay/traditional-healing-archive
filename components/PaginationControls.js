"use client";

import { useEffect, useRef } from "react";
import { UI_TRANSLATIONS } from "../utils/translations.js";
import { useLanguage } from "./LanguageProvider.js";

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 4 },
  progress: {
    display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10,
    fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 13, color: "#9EB3A6", letterSpacing: 0.4, textAlign: "center",
  },
  track: { width: 110, height: 4, borderRadius: 2, backgroundColor: "#232C27", overflow: "hidden" },
  fill: (ratio) => ({
    height: "100%", width: `${Math.round(ratio * 100)}%`,
    backgroundColor: "#B2D095", borderRadius: 2, transition: "width 0.35s ease",
  }),
  sentinel: {
    width: "100%", padding: "12px 0 4px", textAlign: "center", fontSize: 12.5,
    fontStyle: "italic", color: "#6E8A7C", fontFamily: "'Kantumruy Pro', sans-serif", letterSpacing: 0.5,
  },
  done: { fontSize: 12, color: "#6E8A7C", fontFamily: "'Kantumruy Pro', sans-serif", letterSpacing: 0.6, textAlign: "center" },
};

export default function PaginationControls({ visible, total, onLoadMore, lang: langProp }) {
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
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
      <div style={{ ...styles.progress, letterSpacing: lang === "km" ? 0 : 0.4 }}>
        <span>{t.showingProgress(visible, total)}</span>
        <div style={styles.track}><div style={styles.fill(ratio)} /></div>
      </div>
      {hasMore ? (
        <div ref={sentinelRef} role="status" style={styles.sentinel}>
          {t.loadingMore}
        </div>
      ) : (
        <span style={{ ...styles.done, letterSpacing: lang === "km" ? 0 : 0.6 }}>{t.allShown}</span>
      )}
    </div>
  );
}