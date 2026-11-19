import { useState } from "react";
import { UI_TRANSLATIONS } from "../utils/translations.js";
import { useLanguage } from "./LanguageProvider.js";

const buildFilters = (t) => [
  { id: "all", label: t.filterAll }, { id: "name", label: t.filterName }, { id: "family", label: t.filterFamily },
  { id: "uses", label: t.filterUses }, { id: "compounds", label: t.filterCompounds }, { id: "location", label: t.filterLocation },
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
    fontFamily: "inherit", // buttons do not inherit body fonts by default
    border: active ? "1px solid #B2D095" : "1px solid #2D4A3E",
    backgroundColor: active ? "#B2D095" : "#232C27", color: active ? "#0C1511" : "#C1C8C2",
  }),
  count: { fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 13, color: "#9EB3A6", letterSpacing: 0.5 },
};

export default function SearchFilter({ lang: langProp, query, setQuery, activeField, setActiveField, resultCount, totalCount }) {
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const [clearHovered, setClearHovered] = useState(false);
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  return (
    <div className="search-box" style={styles.wrap}>
      <div style={styles.inputBox}>
        <span className="search-icon" style={styles.icon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input id="herbarium-search" className="search-input" type="text"
          placeholder={t.searchPlaceholder}
          value={query} onChange={(e) => setQuery(e.target.value)} style={styles.input} />
        {query.length > 0 && (
          <button type="button" aria-label={t.clearSearchLabel} onClick={() => setQuery("")}
            onMouseEnter={() => setClearHovered(true)} onMouseLeave={() => setClearHovered(false)}
            style={styles.clearBtn(clearHovered)}>
            ✕
          </button>
        )}
      </div>
      <div style={styles.pillRow}>
        <div style={styles.pills}>
          {buildFilters(t).map((f) => (
            <button key={f.id} type="button" style={styles.pill(activeField === f.id)}
              onClick={() => setActiveField(activeField === f.id && f.id !== "all" ? "all" : f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <span style={{ ...styles.count, letterSpacing: lang === "km" ? 0 : 0.5 }}>{t.resultCount(resultCount, totalCount)}</span>
      </div>
    </div>
  );
}
