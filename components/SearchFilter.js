import { useState } from "react";

const FILTERS = [
  { id: "all", label: "All Taxa" }, { id: "name", label: "Names / ឈ្មោះ" }, { id: "family", label: "Family" },
  { id: "uses", label: "Uses / ការប្រើប្រាស់" }, { id: "compounds", label: "Compounds" }, { id: "location", label: "Habitat" },
];

const styles = {
  wrap: { backgroundColor: "#18221D", border: "1px solid #2D4A3E", padding: "16px 18px", borderRadius: 4, display: "flex", flexDirection: "column", gap: 12 },
  inputBox: { position: "relative", display: "flex", alignItems: "center" },
  icon: { position: "absolute", left: 14, color: "#A3D1B8", display: "flex" },
  input: {
    width: "100%", padding: "12px 40px 12px 44px", backgroundColor: "#07100C",
    border: "1px solid #2D4A3E", borderRadius: 4, color: "#DBE5DE", fontSize: 15,
    fontFamily: "'Kantumruy Pro', sans-serif", outline: "none", boxSizing: "border-box",
  },
  clearBtn: (hovered) => ({
    position: "absolute", right: 10, background: "none", border: "none", padding: 0,
    fontSize: 16, lineHeight: 1, cursor: "pointer", fontFamily: "inherit",
    color: hovered ? "#DBE5DE" : "#9EB3A6",
  }),
  pillRow: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 },
  pills: { display: "flex", flexWrap: "wrap", gap: 6 },
  pill: (active) => ({
    padding: "5px 11px", borderRadius: 4, fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer",
    border: active ? "1px solid #B2D095" : "1px solid #2D4A3E",
    backgroundColor: active ? "#B2D095" : "#232C27", color: active ? "#0C1511" : "#C1C8C2",
  }),
  count: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: 13, color: "#9EB3A6", letterSpacing: 0.5 },
};

export default function SearchFilter({ query, setQuery, activeField, setActiveField, resultCount, totalCount }) {
  const [clearHovered, setClearHovered] = useState(false);
  return (
    <div style={styles.wrap}>
      <div style={styles.inputBox}>
        <span style={styles.icon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input id="herbarium-search" type="text"
          placeholder="Search by Khmer name, binomial, active compound, or indication..."
          value={query} onChange={(e) => setQuery(e.target.value)} style={styles.input} />
        {query.length > 0 && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")}
            onMouseEnter={() => setClearHovered(true)} onMouseLeave={() => setClearHovered(false)}
            style={styles.clearBtn(clearHovered)}>
            ✕
          </button>
        )}
      </div>
      <div style={styles.pillRow}>
        <div style={styles.pills}>
          {FILTERS.map((f) => (
            <button key={f.id} type="button" style={styles.pill(activeField === f.id)}
              onClick={() => setActiveField(activeField === f.id && f.id !== "all" ? "all" : f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <span style={styles.count}>Displaying {resultCount} of {totalCount} Records</span>
      </div>
    </div>
  );
}
