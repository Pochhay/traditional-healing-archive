import React from 'react';

const styles = {
  card: {
    padding: 24,
    backgroundColor: "#16221D",
    border: "1px solid #2D4A3E",
    borderLeft: "3px solid #86B29B",
    borderRadius: 10,
  },
  nameKhmer: {
    fontSize: 26,
    color: "#E8ECE9",
    margin: "0 0 4px",
    lineHeight: 1.3,
  },
  nameEnglish: {
    fontSize: 18,
    fontWeight: 600,
    color: "#E8ECE9",
    margin: "0 0 2px",
  },
  scientific: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontSize: 16,
    color: "#86B29B",
    margin: "0 0 16px",
  },
  photo: {
    width: "100%",
    height: 190,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 16,
    border: "1px solid #2D4A3E",
  },
  label: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 12,
    color: "#86B29B",
    margin: "14px 0 0",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    fontSize: 16,
    color: "#E8ECE9",
    lineHeight: 1.8,
    margin: "4px 0 0",
  },
  list: {
    fontSize: 16,
    color: "#E8ECE9",
    lineHeight: 1.8,
    margin: "4px 0 0",
    paddingLeft: 20,
  },
  listItem: {
    margin: "4px 0",
  },
};

const FIELDS = [
  { label: "Species / Family", prop: "family" },
  { label: "Description", prop: "description" },
  { label: "Habitat & Distribution", prop: "location" },
  { label: "Active Compounds", prop: "chemicalCompounds" },
  { label: "Medicinal Uses & Indications", prop: "medicinalUses" },
  { label: "Parts Used", prop: "partsUsed" },
  { label: "Dosage", prop: "dosage" },
  { label: "Caution", prop: "caution" },
];

export default function EntryCard({ entry }) {
  const {
    id,
    nameKhmer,
    nameEnglish,
    scientificName,
    family,
    image,
    description,
    location,
    chemicalCompounds,
    medicinalUses,
    partsUsed,
    dosage,
    caution,
  } = entry;

  const data = { family, description, location, chemicalCompounds, medicinalUses, partsUsed, dosage, caution };
  
  return (
    <article style={styles.card}>
      {image && (
        <img
          src={image}
          alt={`${nameEnglish} (${nameKhmer})`}
          style={styles.photo}
        />
      )}
      <h2 style={styles.nameKhmer}>{nameKhmer}</h2>
      <p style={styles.nameEnglish}>{nameEnglish}</p>
      <p style={styles.scientific}>{scientificName}</p>
      
      {FIELDS.map(({ label, prop }) => {
        const value = data[prop];
        return (
          <div key={label}>
            <p style={styles.label}>{label}</p>
            {Array.isArray(value) ? (
              <p style={styles.value}>{value.join(", ")}</p>
            ) : (
              <p style={styles.value}>{value}</p>
            )}
          </div>
        );
      })}
    </article>
  );
}

