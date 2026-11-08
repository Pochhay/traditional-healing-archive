"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import EntryActions from "../../components/EntryActions.js";

const STATUS_LABELS = {
  pending: "Pending review / កំពុងរង់ចាំការពិនិត្យ", published: "Published / បានផ្សព្វផ្សាយ",
  returned: "Returned for revision / បានប្រគល់ជូនវិញ",
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0C1511", padding: "40px 16px", fontFamily: "'Kantumruy Pro', sans-serif" },
  card: { maxWidth: 720, margin: "0 auto", backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px" },
  back: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#86B29B", textDecoration: "none", marginBottom: 16 },
  title: { color: "#E8ECE9", fontSize: 24, margin: "0 0 4px" },
  subtitle: { color: "#86B29B", fontSize: 14, margin: "0 0 24px" },
  row: { display: "flex", flexDirection: "column", gap: 10, padding: "14px 0", borderBottom: "1px solid #2D4A3E" },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  rowActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  name: { color: "#DBE5DE", fontSize: 15, fontWeight: 600, margin: 0 }, sci: { color: "#86B29B", fontSize: 12, fontStyle: "italic", margin: "2px 0 0" },
  badge: { fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #2D4A3E", color: "#DBE5DE", backgroundColor: "#07100C", whiteSpace: "nowrap" },
  reviewerNote: { width: "100%", backgroundColor: "rgba(255, 180, 171, 0.08)", border: "1px solid rgba(255, 180, 171, 0.3)", color: "#FFB4AB", fontSize: 12, padding: "8px 10px", borderRadius: 4, margin: "6px 0 0", lineHeight: 1.6 },
  note: { color: "#86B29B", margin: 0, lineHeight: 1.8 },
  link: { color: "#B2D095", textDecoration: "none", fontSize: 13 },
};

export default function MyEntriesPage() {
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
    <main style={styles.page}>
      <div style={styles.card}>
        <Link href="/" style={styles.back}>← Back to Archive / ត្រឡប់ទៅទំព័រដើម</Link>
        <h1 style={styles.title}>My entries</h1>
        <p style={styles.subtitle}>រុក្ខជាតិរបស់ខ្ញុំ</p>
        {signedOut ? (
          <p style={styles.note}>
            You must be signed in to view your entries. / សូមចូលគណនីដើម្បីមើលព័ត៌មានរបស់អ្នក។{" "}
            <Link href="/login" style={styles.link}>Sign in / ចូលគណនី</Link>
          </p>
        ) : error ? (
          <p style={styles.note}>Could not load your entries. Please try again later. / មិនអាចទាញយកព័ត៌មានរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។</p>
        ) : entries === null ? (
          <p style={styles.note}>Loading records… / កំពុងផ្ទុកព័ត៌មាន…</p>
        ) : entries.length === 0 ? (
          <p style={styles.note}>
            You have not submitted any entries yet. / អ្នកមិនទាន់បានបញ្ចូលព័ត៌មាននៅឡើយទេ។{" "}
            <Link href="/contribute" style={styles.link}>+ Contribute / + បញ្ចូលថ្មី</Link>
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={styles.row}>
              <div style={styles.rowTop}>
                <div>
                  <p style={styles.name}>{entry.title}</p>
                  <p style={styles.sci}>{entry.scientific_name}</p>
                </div>
                <div style={styles.rowActions}>
                  <span style={styles.badge}>{STATUS_LABELS[entry.status] ?? entry.status}</span>
                  <EntryActions entry={entry} onDelete={removeEntry} />
                </div>
              </div>
              {entry.status === "returned" && entry.review_note && (
                <p style={styles.reviewerNote}>Reviewer note / ចំណាំពីអ្នកពិនិត្យ: {entry.review_note}</p>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}