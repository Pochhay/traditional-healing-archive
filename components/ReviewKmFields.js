"use client";

import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const FIELDS = [
  { key: "description_km", label: "labelDescriptionKm" },
  { key: "habitat_km", label: "labelHabitatKm" },
  { key: "medicinal_uses_km", label: "labelUsesKm" },
  { key: "parts_used_km", label: "labelPartsUsedKm" },
  { key: "dosage_km", label: "labelDosageKm" },
  { key: "caution_km", label: "labelCautionKm" },
];

const styles = (km) => ({
  box: { backgroundColor: "#141D19", border: "1px solid #2D4A3E", borderRadius: 4, padding: "10px 12px" },
  heading: {
    fontSize: 11, letterSpacing: km ? 0 : 1, color: "#B2D095", margin: 0, fontWeight: 600,
    textTransform: km ? "none" : "uppercase",
  },
  label: { fontSize: 11, color: "#86B29B", margin: "8px 0 2px" },
  text: { fontSize: 12.5, color: "#DBE5DE", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" },
});

export default function ReviewKmFields({ entry }) {
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const styles_ = styles(lang === "km");
  const present = FIELDS.filter((f) => (entry[f.key] ?? "").trim() !== "");
  if (present.length === 0) return null; // Nothing submitted: render no wrapper at all.
  return (
    <div style={styles_.box}>
      <p style={styles_.heading}>{t.reviewKmHeading}</p>
      {present.map((f) => (
        <div key={f.key}>
          <p style={styles_.label}>{t[f.label]}</p>
          <p style={styles_.text}>{entry[f.key]}</p>
        </div>
      ))}
    </div>
  );
}