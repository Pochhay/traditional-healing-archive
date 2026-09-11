const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 12, flex: "1 1 340px" },
  header: { borderBottom: "1px solid #2D4A3E", paddingBottom: 8 },
  khmer: { fontSize: 24, fontWeight: 600, color: "#A3D1B8", margin: "0 0 2px" },
  english: { fontSize: 16, fontWeight: 500, color: "#DBE5DE", margin: "0 0 2px" },
  scientific: { fontFamily: "'EB Garamond', Georgia, serif", fontStyle: "italic", fontSize: 15, color: "#B2D095", margin: 0 },
  desc: { fontSize: 13.5, color: "#C1C8C2", lineHeight: 1.6, margin: 0 },
  label: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: 11, letterSpacing: 1.2, color: "#86B29B", textTransform: "uppercase", margin: "0 0 4px" },
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

export default function SpecimenDetails({ entry }) {
  const { nameKhmer, nameEnglish, scientificName, description, chemicalCompounds, medicinalUses, partsUsed, dosage, caution } = entry;
  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={styles.khmer}>{nameKhmer}</h2>
        <p style={styles.english}>{nameEnglish}</p>
        <p style={styles.scientific}>{scientificName}</p>
      </div>
      <p style={styles.desc}>{description}</p>
      {chemicalCompounds?.length > 0 && (
        <div>
          <p style={styles.label}>Active Compounds</p>
          <div style={styles.tagGroup}>
            {chemicalCompounds.map((c) => <span key={c} style={styles.tag}>{c}</span>)}
          </div>
        </div>
      )}
      {medicinalUses?.length > 0 && (
        <div>
          <p style={styles.label}>Medicinal Uses & Indications</p>
          <ul style={styles.useList}>
            {medicinalUses.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        </div>
      )}
      {(partsUsed || dosage) && (
        <div style={{ fontSize: 12.5, color: "#9EB3A6", lineHeight: 1.5 }}>
          {partsUsed && <div><strong style={{ color: "#DBE5DE" }}>Parts Used:</strong> {partsUsed}</div>}
          {dosage && <div><strong style={{ color: "#DBE5DE" }}>Dosage:</strong> {dosage}</div>}
        </div>
      )}
      {caution && <div style={styles.caution}><strong>Caution:</strong> {caution}</div>}
    </div>
  );
}
