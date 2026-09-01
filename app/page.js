import collection from "../collection.config.js";
import entries from "../data/entries.js";
import EntryCard from "../components/EntryCard.js";

export default function Home() {
  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER HERBAL PLANT ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      <div style={styles.card}>
        <p style={styles.cardLabel}>CURATED BY</p>
        <p style={styles.cardValue}>{collection.curator}</p>
      </div>
      <div style={styles.card}>
        <p style={styles.cardLabel}>SOURCE</p>
        <p style={styles.cardValue}>{collection.source}</p>
      </div>

      <p style={styles.count}>entries in the archive: {entries.length}</p>

      <div style={{ display: "grid", gap: 24 }}>
        {entries.map((entry) => (
          <EntryCard key={entry.nameEnglish} {...entry} />
        ))}
      </div>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
        2026. 
      </footer>
    </main>
  );
}

const styles = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "80px 24px",
  },
  kicker: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    color: "#86B29B",
    fontSize: 15,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    color: "#E8ECE9",
    margin: "16px 0 12px",
    lineHeight: 1.1,
  },
  description: {
    fontSize: 19,
    color: "#E8ECE9",
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    marginTop: 48,
    padding: 24,
    backgroundColor: "#16221D",
    border: "1px solid #2D4A3E",
    borderLeft: "3px solid #86B29B",
    borderRadius: 10,
  },
  cardLabel: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 13,
    color: "#86B29B",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 17,
    color: "#E8ECE9",
    margin: "6px 0 0",
  },
  count: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontSize: 15,
    color: "#86B29B",
    marginTop: 48,
  },
  footer: {
    marginTop: 64,
    paddingTop: 24,
    borderTop: "1px solid #2D4A3E",
    fontSize: 14,
    color: "#86B29B",
  },
};