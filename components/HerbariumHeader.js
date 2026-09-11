import collection from "../collection.config.js";

const styles = {
  header: { padding: "40px 0 20px", display: "flex", flexDirection: "column", gap: 16 },
  badgeRow: {
    display: "inline-flex", alignItems: "center", gap: 8,
    backgroundColor: "#232C27", padding: "4px 12px", borderRadius: 4, width: "fit-content",
  },
  pulseDot: { width: 8, height: 8, borderRadius: "50%", backgroundColor: "#B2D095" },
  badgeText: {
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: 11,
    letterSpacing: 2, color: "#B2D095", textTransform: "uppercase", fontWeight: 600,
  },
  title: {
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: 36,
    fontWeight: 500, color: "#A3D1B8", margin: "4px 0 2px", letterSpacing: -0.5,
  },
  titleKhmer: {
    fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 20,
    color: "#B2D095", fontWeight: 500, margin: "0 0 10px",
  },
  desc: { fontSize: 15, color: "#C1C8C2", lineHeight: 1.7, margin: 0 },
  metaStack: {
    display: "flex", flexDirection: "column", gap: 12, marginTop: 6,
  },
  metaCard: {
    backgroundColor: "#18221D", border: "1px solid #2D4A3E",
    padding: "12px 16px", borderRadius: 4,
  },
  metaLabel: {
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: 11,
    letterSpacing: 1.5, color: "#A3D1B8", textTransform: "uppercase", margin: 0,
  },
  metaValue: { fontSize: 14, color: "#DBE5DE", margin: "4px 0 0", lineHeight: 1.5 },
};

export default function HerbariumHeader() {
  return (
    <header style={styles.header}>
      <div style={styles.badgeRow}>
        <span style={styles.pulseDot} />
        <span style={styles.badgeText}>National Herbarium Digital Repository</span>
      </div>
      <div>
        <h1 style={styles.title}>{collection.name}</h1>
        <p style={styles.titleKhmer}>បណ្ណាសារឱសថរុក្ខជាតិខ្មែរ</p>
        <p style={styles.desc}>{collection.description}</p>
      </div>
      <div style={styles.metaStack}>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Curator / បុគ្គលិករៀបចំ</p>
          <p style={styles.metaValue}>{collection.curator}</p>
        </div>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>Botanical Source / ប្រភព</p>
          <p style={styles.metaValue}>{collection.source}</p>
        </div>
      </div>
    </header>
  );
}
