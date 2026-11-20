"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import EntryActions from "../../components/EntryActions.js";
import BackLink from "../../components/BackLink.js";
import ScientificName from "../../components/ScientificName.js";
import { useLanguage } from "../../components/LanguageProvider.js";
import { UI_TRANSLATIONS } from "../../utils/translations.js";

const statusLabel = (t, status) => (
  { pending: t.statusPending, published: t.statusPublished, returned: t.statusReturned }[status] ?? status
);

const styles = {
  page: { minHeight: "calc(100vh - 68px)", backgroundColor: "#0C1511", padding: "28px 16px 48px", fontFamily: "'Kantumruy Pro', sans-serif" },
  card: { maxWidth: 720, margin: "0 auto", backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px" },
  topBar: { display: "flex", alignItems: "center", marginBottom: 18 },
  title: { color: "#E8ECE9", fontSize: 24, margin: "0 0 4px" },
  subtitle: { color: "#86B29B", fontSize: 14, margin: "0 0 24px" },
  row: { display: "flex", flexDirection: "column", gap: 10, padding: "14px 0", borderBottom: "1px solid #2D4A3E" },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  rowActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  name: { color: "#DBE5DE", fontSize: 15, fontWeight: 600, margin: 0 }, sci: { color: "#86B29B", fontSize: 12, margin: "2px 0 0" },
  badge: { fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #2D4A3E", color: "#DBE5DE", backgroundColor: "#07100C", whiteSpace: "nowrap" },
  reviewerNote: { width: "100%", backgroundColor: "rgba(255, 180, 171, 0.08)", border: "1px solid rgba(255, 180, 171, 0.3)", color: "#FFB4AB", fontSize: 12, padding: "8px 10px", borderRadius: 4, margin: "6px 0 0", lineHeight: 1.6 },
  note: { color: "#86B29B", margin: 0, lineHeight: 1.8 },
  link: { color: "#B2D095", textDecoration: "none", fontSize: 13 },
};

export default function MyEntriesPage() {
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const [entries, setEntries] = useState(null); // null = loading
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState(false);
  const removeEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return setSignedOut(true);
      supabase.from("entries")
        .select("id, title, scientific_name, status, review_note")
        .eq("owner", u.id).order("created_at", { ascending: false })
        .then(({ data: rows, error: fetchError }) => {
          // A silent failure here would falsely show "no entries".
          if (fetchError) { console.error(fetchError); setError(true); } else { setEntries(rows ?? []); }
        });
    });
  }, []);

  return (
    <main className="subpage-shell" style={styles.page}>
      <div className="subpage-card" style={styles.card}>
        <div style={styles.topBar}>
          <BackLink />
        </div>
        <h1 style={styles.title}>{t.myEntriesTitle}</h1>
        <p style={styles.subtitle}>{t.myEntriesSubtitle}</p>
        {signedOut ? (
          <p style={styles.note}>
            {t.myEntriesSignedOut}{" "}
            <Link href="/login" style={styles.link}>{t.navSignIn}</Link>
          </p>
        ) : error ? (
          <p style={styles.note}>{t.myEntriesError}</p>
        ) : entries === null ? (
          <p style={styles.note}>{t.myEntriesLoading}</p>
        ) : entries.length === 0 ? (
          <p style={styles.note}>
            {t.myEntriesEmpty}{" "}
            <Link href="/contribute" style={styles.link}>{t.navContribute}</Link>
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={styles.row}>
              <div className="my-entry-row-top" style={styles.rowTop}>
                <div>
                  <p style={styles.name}>{entry.title}</p>
                  <p style={styles.sci}><ScientificName name={entry.scientific_name} /></p>
                </div>
                <div style={styles.rowActions}>
                  <span style={styles.badge}>{statusLabel(t, entry.status)}</span>
                  <EntryActions entry={entry} onDelete={removeEntry} />
                </div>
              </div>
              {entry.status === "returned" && entry.review_note && (
                <p style={styles.reviewerNote}>{t.reviewerNoteLabel} {entry.review_note}</p>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}