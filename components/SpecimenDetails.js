import HighlightText from "./HighlightText.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";
import { useLanguage } from "./LanguageProvider.js";

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 12, flex: "1 1 340px", minWidth: 0, overflowWrap: "anywhere" },
  header: { borderBottom: "1px solid #2D4A3E", paddingBottom: 8 },
  khmer: { fontSize: 24, fontWeight: 600, color: "#A3D1B8", margin: "0 0 2px" },
  english: { fontSize: 16, fontWeight: 500, color: "#DBE5DE", margin: "0 0 2px" },
  scientific: { fontFamily: "'Kantumruy Pro', sans-serif", fontStyle: "italic", fontSize: 15, color: "#B2D095", margin: 0 },
  desc: { fontSize: 13.5, color: "#C1C8C2", lineHeight: 1.6, margin: 0 },
  label: { fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 11, letterSpacing: 1.2, color: "#86B29B", textTransform: "uppercase", margin: "0 0 4px" },
  tagGroup: { display: "flex", flexWrap: "wrap", gap: 5 },
  tag: {
    backgroundColor: "rgba(200, 230, 169, 0.08)", border: "1px solid rgba(200, 230, 169, 0.25)",
    color: "#C8E6A9", fontSize: 12, padding: "2px 8px", borderRadius: 3,
  },
  useList: { margin: 0, paddingLeft: 18, color: "#DBE5DE", fontSize: 13, lineHeight: 1.6 },
  caution: {
    backgroundColor: "rgba(255, 180, 171, 0.08)", border: "1px solid rgba(255, 180, 171, 0.3)",
    color: "#FFB4AB", padding: "8px 12px", borderRadius: 4, fontSize: 12.5,
  },
};

export default function SpecimenDetails({ entry, query = "", lang: langProp }) {
  const { nameKhmer, nameEnglish, scientificName, description, chemicalCompounds, medicinalUses, dosage, caution, partsUsed } = entry;
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  // Khmer vowel signs and subscripts must not be spaced or upper-cased.
  const label = { ...styles.label, letterSpacing: lang === "km" ? 0 : 1.2, textTransform: lang === "km" ? "none" : "uppercase" };
  return (
    <div className="specimen-details" style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={styles.khmer}><HighlightText text={nameKhmer} query={query} /></h2>
        <p style={styles.english}><HighlightText text={nameEnglish} query={query} /></p>
        <p style={styles.scientific}><HighlightText text={scientificName} query={query} /></p>
      </div>
      <p style={styles.desc}><HighlightText text={description} query={query} /></p>
      {chemicalCompounds?.length > 0 && (
        <div>
          <p style={label}>{t.activeCompounds}</p>
          <div style={styles.tagGroup}>
            {chemicalCompounds.map((c, i) => <span key={`${c}-${i}`} style={styles.tag}><HighlightText text={c} query={query} /></span>)}
          </div>
        </div>
      )}
      {medicinalUses?.length > 0 && (
        <div>
          <p style={label}>{t.medicinalUses}</p>
          <ul style={styles.useList}>
            {medicinalUses.map((u, i) => <li key={i}><HighlightText text={u} query={query} /></li>)}
          </ul>
        </div>
      )}
      {(dosage || partsUsed) && (
        <div style={{ fontSize: 12.5, color: "#9EB3A6", lineHeight: 1.5 }}>
          {partsUsed && <div><strong style={{ color: "#DBE5DE" }}>{t.partsUsed}:</strong> <HighlightText text={partsUsed} query={query} /></div>}
          {dosage && <div><strong style={{ color: "#DBE5DE" }}>{t.dosage}:</strong> <HighlightText text={dosage} query={query} /></div>}
        </div>
      )}
      {caution && <div style={styles.caution}><strong>{t.caution}:</strong> <HighlightText text={caution} query={query} /></div>}
    </div>
  );
}
