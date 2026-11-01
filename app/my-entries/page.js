"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";

const STATUS_LABELS = {
  pending: "Pending review / កំពុងរង់ចាំការពិនិត្យ",
  published: "Published / បានផ្សព្វផ្សាយ",
  returned: "Returned for revision / បានប្រគល់ជូនវិញ",
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0C1511", padding: "40px 16px", fontFamily: "'Kantumruy Pro', sans-serif" },
  card: { maxWidth: 720, margin: "0 auto", backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px" },
  title: { color: "#E8ECE9", fontSize: 24, margin: "0 0 4px" },
  subtitle: { color: "#86B29B", fontSize: 14, margin: "0 0 24px" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #2D4A3E", flexWrap: "wrap" },
  name: { color: "#DBE5DE", fontSize: 15, fontWeight: 600, margin: 0 },
  sci: { color: "#86B29B", fontSize: 12, fontStyle: "italic", margin: "2px 0 0" },
  badge: { fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #2D4A3E", color: "#DBE5DE", backgroundColor: "#07100C", whiteSpace: "nowrap" },
  note: { color: "#86B29B", margin: 0, lineHeight: 1.8 },
  link: { color: "#B2D095", textDecoration: "none", fontSize: 13 },
};

export default function MyEntriesPage() {
  const [entries, setEntries] = useState(null); // null = loading
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return setSignedOut(true);
      supabase.from("entries")
        .select("id, title, scientific_name, status")
        .eq("owner", u.id)
        .order("created_at", { ascending: false })
        .then(({ data: rows, error: fetchError }) => {
          // A silent failure here would falsely show "no entries".
          if (fetchError) { console.error(fetchError); setError(true); } else { setEntries(rows ?? []); }
        });
    });
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
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
              <div>
                <p style={styles.name}>{entry.title}</p>
                <p style={styles.sci}>{entry.scientific_name}</p>
              </div>
              <span style={styles.badge}>{STATUS_LABELS[entry.status] ?? entry.status}</span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}