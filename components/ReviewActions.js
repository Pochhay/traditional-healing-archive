"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

const S = {
  wrap: { display: "flex", flexDirection: "column", gap: 8 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  publish: { fontSize: 12, fontWeight: 600, color: "#0C1511", backgroundColor: "#B2D095", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  ret: { fontSize: 12, color: "#FFB4AB", backgroundColor: "transparent", border: "1px solid #2D4A3E", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  confirm: { fontSize: 12, fontWeight: 600, color: "#0C1511", backgroundColor: "#B2D095", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit", opacity: 0.85 },
  cancel: { fontSize: 12, color: "#86B29B", backgroundColor: "transparent", border: "1px solid #2D4A3E", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  note: { width: "100%", boxSizing: "border-box", backgroundColor: "#07100C", border: "1px solid #2D4A3E", borderRadius: 4, color: "#DBE5DE", fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 13, padding: "8px 10px", minHeight: 56, resize: "vertical" },
  err: { color: "#FFB4AB", fontSize: 12, margin: 0 },
};

export default function ReviewActions({ entry, onDecided }) {
  const [busy, setBusy] = useState(null);
  const [failed, setFailed] = useState(false);
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState("");

  async function review(decision, reviewNote) {
    setBusy(decision);
    setFailed(false);
    const args = { entry_id: entry.id, decision };
    if (reviewNote !== undefined) args.note = reviewNote; // Publish sends no note.
    const { data, error } = await supabase.rpc("review_entry", args);
    setBusy(null);
    if (!error && data === true) return onDecided(entry.id);
    console.error("Review action failed:", error, "returned:", data);
    setFailed(true);
  }

  return (
    <div style={S.wrap}>
      {returning ? (
        <>
          <textarea style={S.note} value={note} autoFocus
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for returning (optional) / មូលហេតុនៃការប្រគល់ (ស្រេចចិត្ត)" />
          <div style={S.actions}>
            <button type="button" disabled={busy !== null} onClick={() => review("returned", note.trim() || null)}
              style={{ ...S.confirm, opacity: busy ? 0.6 : 1 }}>Confirm return / បញ្ជាក់ការប្រគល់</button>
            <button type="button" onClick={() => setReturning(false)} style={S.cancel}>Cancel / បោះបង់</button>
          </div>
        </>
      ) : (
        <div style={S.actions}>
          <button type="button" disabled={busy !== null} onClick={() => review("published")} style={S.publish}>Publish / ផ្សាយ</button>
          <button type="button" disabled={busy !== null} onClick={() => setReturning(true)} style={S.ret}>Return / ប្រគល់ជូនវិញ</button>
        </div>
      )}
      {failed && <p style={S.err}>That decision was not saved. Please try again. / សម្រេចចិត្តមិនបានរក្សាទុកទេ។ សូមព្យាយាមម្តងទៀត។</p>}
    </div>
  );
}