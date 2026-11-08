"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import ReviewCard from "../../components/ReviewCard.js";

const supabase = createClient();

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0C1511", padding: "40px 16px", fontFamily: "'Kantumruy Pro', sans-serif" },
  wrap: { maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 },
  back: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#86B29B", textDecoration: "none" },
  title: { color: "#E8ECE9", fontSize: 24, margin: "0 0 4px" },
  subtitle: { color: "#86B29B", fontSize: 14, margin: "0 0 24px" },
  note: { color: "#86B29B", margin: 0, lineHeight: 1.8 },
  gate: { backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px" },
  link: { color: "#B2D095", textDecoration: "none", fontSize: 13 },
};

export default function ReviewPage() {
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
    <main style={styles.page}>
      <div style={styles.wrap}>
        <Link href="/" style={styles.back}>← Back to Archive / ត្រឡប់ទៅទំព័រដើម</Link>
        <h1 style={styles.title}>Review queue</h1>
        <p style={styles.subtitle}>កន្លែងពិនិត្យរុក្ខជាតិរង់ចាំ</p>
        {state === "loading" && <p style={styles.note}>Loading queue… / កំពុងផ្ទុក…</p>}
        {state === "denied" && (
          <div style={styles.gate}>
            <p style={styles.note}>Reviewer access is required to view this page. / ត្រូវការសិទ្ធិអ្នកពិនិត្យដើម្បីមើលទំព័រនេះ។</p>
            <p style={{ margin: "12px 0 0" }}>
              <Link href="/" style={styles.link}>← Back to Archive</Link>
            </p>
          </div>
        )}
        {state === "error" && (
          <div style={styles.gate}>
            <p style={styles.note}>Could not load the review queue. Please try again later. / មិនអាចទាញយកបញ្ជីបានទេ។ សូមព្យាយាមម្តងទៀត។</p>
          </div>
        )}
        {state === "ready" && queue.length === 0 && (
          <div style={styles.gate}>
            <p style={styles.note}>No entries are waiting for review. / មិនមានព័ត៌មានរង់ចាំការពិនិត្យទេ។</p>
          </div>
        )}
        {state === "ready" && queue.map((entry) => (
          <ReviewCard key={entry.id} entry={entry} onDecided={remove} />
        ))}
      </div>
    </main>
  );
}