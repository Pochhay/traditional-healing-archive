"use client";
import React, { useState } from 'react';
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
};

// Single source of truth: field key -> { label, propName }
const FIELDS = [
  { label: "Species / Family", prop: "family" },
  { label: "Description", prop: "description" },
  { label: "Habitat & Distribution", prop: "habitat" },
  { label: "Active Compounds", prop: "compounds" },
  { label: "Medicinal Uses & Indications", prop: "uses" },
];

/**
 * PlantCard displays a single Khmer medicinal plant entry.
 * @param {Object} props
 * @param {string} props.nameKhmer       Khmer name (e.g. "ស្តៅ")
 * @param {string} props.nameEnglish     Common English name (e.g. "Siamese Neem")
 * @param {string} props.scientificName  Botanical name (e.g. "Azadirachta indica var. siamensis")
 * @param {string} props.family          Botanical family
 * @param {string} props.image           Image path under /public/images/
 * @param {string} props.description     Physical characteristics
 * @param {string} props.habitat         Where it grows in Cambodia
 * @param {string} props.compounds       Key phytochemicals
 * @param {string} props.uses            Traditional therapeutic uses
 */
export default function EntryCard({
  nameKhmer,
  nameEnglish,
  scientificName,
  family,
  image,
  description,
  habitat,
  compounds,
  uses,
}) {

const [isHovered, setIsHovered] = useState(false);
   const cardStyle = {
     ...styles.card,
     transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
     transition: 'transform 0.2s ease, border-color 0.2s ease',
     borderLeftColor: isHovered ? '#C8E6A9' : styles.card.borderLeft,
   };
  return (
    <article
       style={cardStyle}
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
     >
      <img
        src={image}
        alt={`${nameEnglish} (${nameKhmer})`}
        style={styles.photo}
      />
      <h2 style={styles.nameKhmer}>{nameKhmer}</h2>
      <p style={styles.nameEnglish}>{nameEnglish}</p>
      <p style={styles.scientific}>{scientificName}</p>
      {FIELDS.map(({ label, prop }) => {
        const data = { family, description, habitat, compounds, uses };
        return (
          <div key={label}>
            <p style={styles.label}>{label}</p>
            <p style={styles.value}>{data[prop]}</p>
          </div>
        );
      })}
    </article>
  );
}

