"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

const S = {
  card: { backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: 18, display: "flex", flexDirection: "column", gap: 12 },
  head: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, borderBottom: "1px solid #232C27", paddingBottom: 8 },
  khmer: { fontSize: 20, fontWeight: 600, color: "#A3D1B8", margin: 0 },
  sci: { fontFamily: "'EB Garamond', Georgia, serif", fontStyle: "italic", fontSize: 13, color: "#B2D095", margin: 0 },
  body: { display: "flex", flexWrap: "wrap", gap: 16 },
  photo: { width: 180, height: 130, objectFit: "cover", borderRadius: 3, border: "1px solid #2D4A3E", backgroundColor: "#0C1511" },
  fields: { flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 10.5, letterSpacing: 1, color: "#86B29B", textTransform: "uppercase", margin: "0 0 2px" },
  text: { fontSize: 13, color: "#DBE5DE", lineHeight: 1.6, margin: 0 },
  tags: { display: "flex", flexWrap: "wrap", gap: 5 },
  tag: { backgroundColor: "rgba(200, 230, 169, 0.08)", border: "1px solid rgba(200, 230, 169, 0.25)", color: "#C8E6A9", fontSize: 12, padding: "2px 8px", borderRadius: 3 },
  caution: { backgroundColor: "rgba(255, 180, 171, 0.08)", border: "1px solid rgba(255, 180, 171, 0.3)", color: "#FFB4AB", padding: "8px 12px", borderRadius: 4, fontSize: 12.5 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  publish: { fontSize: 12, fontWeight: 600, color: "#0C1511", backgroundColor: "#B2D095", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  ret: { fontSize: 12, color: "#FFB4AB", backgroundColor: "transparent", border: "1px solid #2D4A3E", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  err: { color: "#FFB4AB", fontSize: 12, margin: 0 },
};

const Field = ({ label, value }) => (<div><p style={S.label}>{label}</p><p style={S.text}>{value}</p></div>);

export default function ReviewCard({ entry, onDecided }) {
  const [busy, setBusy] = useState(null);
  const [failed, setFailed] = useState(false);
  const uses = (entry.medicinal_uses || "").split("\n").filter(Boolean);
  const compounds = (entry.chemical_compounds || "").split(/[;\n]/).map((t) => t.trim()).filter(Boolean);

  async function decide(decision) {
    setBusy(decision); setFailed(false);
    // The review_entry RPC is the only door — never update the table directly.
    const { data, error } = await supabase.rpc("review_entry", { entry_id: entry.id, decision });
    setBusy(null);
    if (!error && data === true) return onDecided(entry.id);
    console.error("Review action failed:", error, "returned:", data);
    setFailed(true);
  }

  return (
    <article style={S.card}>
      <div style={S.head}>
        <div>
          <h2 style={S.khmer}>{entry.name_khmer}</h2>
          <p style={S.sci}>{entry.title} · {entry.scientific_name} · {entry.family}</p>
        </div>
        <span style={S.sci}>{entry.contributor} · {new Date(entry.created_at).toLocaleDateString()}</span>
      </div>
      <div style={S.body}>
        {entry.photo_url && <img src={entry.photo_url} alt={entry.name_khmer} style={S.photo} />}
        <div style={S.fields}>
          <Field label="Description" value={entry.description} />
          <Field label="Habitat & distribution" value={entry.habitat} />
          <div>
            <p style={S.label}>Medicinal uses</p>
            <ul style={{ ...S.text, paddingLeft: 18 }}>{uses.map((u, i) => <li key={i}>{u}</li>)}</ul>
          </div>
          {compounds.length > 0 && (
            <div>
              <p style={S.label}>Active compounds</p><div style={S.tags}>{compounds.map((c, i) => <span key={`${c}-${i}`} style={S.tag}>{c}</span>)}</div>
            </div>
          )}
          {entry.dosage && <Field label="Dosage" value={entry.dosage} />}
          {entry.caution && <div style={S.caution}><strong>Caution:</strong> {entry.caution}</div>}
        </div>
      </div>
      {failed && <p style={S.err}>That decision was not saved. Please try again. / សម្រេចចិត្តមិនបានរក្សាទុកទេ។ សូមព្យាយាមម្តងទៀត។</p>}
      <div style={S.actions}>
        <button type="button" disabled={busy !== null} onClick={() => decide("published")} style={{ ...S.publish, opacity: busy ? 0.6 : 1 }}>Publish / ផ្សាយ</button>
        <button type="button" disabled={busy !== null} onClick={() => decide("returned")} style={S.ret}>Return / ប្រគល់ជូនវិញ</button>
      </div>
    </article>
  );
}