"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import ReviewCard from "../../components/ReviewCard.js";
import BackLink from "../../components/BackLink.js";
import { useLanguage } from "../../components/LanguageProvider.js";
import { UI_TRANSLATIONS } from "../../utils/translations.js";

const supabase = createClient();

const styles = {
  page: { minHeight: "calc(100vh - 68px)", padding: "28px 16px 48px", fontFamily: "'Kantumruy Pro', sans-serif" },
  wrap: { maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 },
  topBar: { display: "flex", alignItems: "center", marginBottom: 4 },
  title: { color: "#E8ECE9", fontSize: 24, margin: "0 0 4px" },
  subtitle: { color: "#86B29B", fontSize: 14, margin: "0 0 24px" },
  note: { color: "#86B29B", margin: 0, lineHeight: 1.8 },
  gate: { backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px" },
  link: { color: "#B2D095", textDecoration: "none", fontSize: 13 },
};

export default function ReviewPage() {
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  // "loading" | "denied" | "error" | "ready"
  const [state, setState] = useState("loading");
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    supabase.rpc("is_reviewer").then(({ data: reviewer }) => {
      if (reviewer !== true) return setState("denied");
      supabase.from("entries")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true }) // oldest first
        .then(({ data, error: fetchError }) => {
          if (fetchError) { console.error(fetchError); return setState("error"); }
          setQueue(data ?? []);
          setState("ready");
        });
    });
  }, []);

  const remove = (id) => setQueue((prev) => prev.filter((e) => e.id !== id));

  return (
    <main className="subpage-shell" style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.topBar}>
          <BackLink />
        </div>
        <h1 style={styles.title}>{t.reviewTitle}</h1>
        <p style={styles.subtitle}>{t.reviewSubtitle}</p>
        {state === "loading" && <p style={styles.note}>{t.reviewLoading}</p>}
        {state === "denied" && (
          <div className="subpage-card" style={styles.gate}>
            <p style={styles.note}>{t.reviewDenied}</p>
            <div style={{ marginTop: 14 }}>
              <BackLink />
            </div>
          </div>
        )}
        {state === "error" && (
          <div className="subpage-card" style={styles.gate}>
            <p style={styles.note}>{t.reviewError}</p>
          </div>
        )}
        {state === "ready" && queue.length === 0 && (
          <div className="subpage-card" style={styles.gate}>
            <p style={styles.note}>{t.reviewEmpty}</p>
          </div>
        )}
        {state === "ready" && queue.map((entry) => (
          <ReviewCard key={entry.id} entry={entry} onDecided={remove} />
        ))}
      </div>
    </main>
  );
}