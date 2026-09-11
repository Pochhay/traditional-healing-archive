import React from "react";
import SpecimenDetails from "./SpecimenDetails.js";

const styles = {
  card: {
    backgroundColor: "#16221D", border: "1px solid #2D4A3E",
    borderRadius: 4, padding: 18, display: "flex", flexDirection: "column", gap: 14,
  },
  ribbon: {
    display: "flex", flexWrap: "wrap", alignItems: "center",
    justifyContent: "space-between", gap: 8, paddingBottom: 10,
    borderBottom: "1px solid #232C27",
  },
  accession: {
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: 11,
    letterSpacing: 1.5, color: "#A3D1B8", textTransform: "uppercase", fontWeight: 600,
  },
  familyBadge: {
    fontSize: 11, color: "#B2D095", backgroundColor: "#232C27",
    border: "1px solid #2D4A3E", padding: "2px 8px", borderRadius: 3,
    fontWeight: 500,
  },
  body: { display: "flex", flexWrap: "wrap", gap: 18 },
  photoPane: { flex: "1 1 240px", maxWidth: 300, display: "flex", flexDirection: "column", gap: 8 },
  photo: {
    width: "100%", height: 210, objectFit: "cover", borderRadius: 3,
    border: "1px solid #2D4A3E", backgroundColor: "#0C1511",
  },
  habitatBox: {
    backgroundColor: "#141D19", border: "1px solid #232C27",
    padding: "8px 10px", borderRadius: 3, fontSize: 12, color: "#9EB3A6", lineHeight: 1.4,
  },
  habitatLabel: {
    fontFamily: "'EB Garamond', Georgia, serif", fontSize: 10.5,
    letterSpacing: 1, color: "#86B29B", textTransform: "uppercase", margin: "0 0 2px",
  },
};

export default function EntryCard({ entry }) {
  const { id, family, image, nameEnglish, nameKhmer, location } = entry;
  return (
    <article style={styles.card}>
      <div style={styles.ribbon}>
        <span style={styles.accession}>Accession: KH-MED-{id.toUpperCase()}</span>
        <span style={styles.familyBadge}>Family: {family}</span>
      </div>
      <div style={styles.body}>
        <div style={styles.photoPane}>
          {image && (
            <img src={image} alt={`${nameEnglish} (${nameKhmer})`} style={styles.photo} />
          )}
          {location && (
            <div style={styles.habitatBox}>
              <p style={styles.habitatLabel}>Habitat & Ecozone</p>
              <span>{location}</span>
            </div>
          )}
        </div>
        <SpecimenDetails entry={entry} />
      </div>
    </article>
  );
}
