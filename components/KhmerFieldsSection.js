"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

// One row per optional Khmer field: the array drives the whole panel.
const FIELDS = [
  { key: "descriptionKm", label: "labelDescriptionKm", textarea: true },
  { key: "habitatKm", label: "labelHabitatKm", textarea: false },
  { key: "medicinalUsesKm", label: "labelUsesKm", textarea: true },
  { key: "dosageKm", label: "labelDosageKm", textarea: true },
  { key: "cautionKm", label: "labelCautionKm", textarea: true },
];

const styles = (km) => ({
  card: { backgroundColor: "#141D19", border: "1px solid #2D4A3E", borderRadius: 4, padding: "14px 16px", marginTop: 18 },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" },
  heading: { fontSize: 13, color: "#B2D095", margin: 0, fontWeight: 600 },
  hint: { fontSize: 12, color: "#86B29B", margin: "8px 0 0", lineHeight: 1.6 },
  toggle: {
    fontSize: 12, color: "#B2D095", backgroundColor: "transparent", border: "1px solid #2D4A3E",
    borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit",
  },
  label: { display: "block", fontSize: 12, color: "#86B29B", letterSpacing: km ? 0 : 0.5, margin: "14px 0 6px" },
  input: {
    width: "100%", boxSizing: "border-box", backgroundColor: "#07100C", border: "1px solid #2D4A3E",
    borderRadius: 4, color: "#DBE5DE", fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "10px 12px",
  },
  error: { color: "#FFB4AB", fontSize: 12, margin: "6px 0 0" },
});

export default function KhmerFieldsSection({ form, errors, setField, onBlurField }) {
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const styles_ = styles(lang === "km");
  const hasContent = FIELDS.some((f) => (form[f.key] ?? "").trim() !== "");
  // Start open when the entry already carries Khmer text; otherwise stay collapsed.
  const [open, setOpen] = useState(hasContent);

  // Editing loads the entry after mount, so open once Khmer text actually arrives.
  useEffect(() => { if (hasContent) setOpen(true); }, [hasContent]);

  return (
    <section style={styles_.card}>
      <div style={styles_.head}>
        <h3 style={styles_.heading}>{t.kmSectionTitle}</h3>
        <button type="button" onClick={() => setOpen((v) => !v)} style={styles_.toggle}>
          {open ? t.hideKmFields : t.showKmFields}
        </button>
      </div>
      {open && (
        <div>
          <p style={styles_.hint}>{t.kmSectionHint}</p>
          {FIELDS.map((f) => {
            const style = f.textarea ? { ...styles_.input, minHeight: 90, resize: "vertical" } : styles_.input;
            const props = {
              id: f.key, style, value: form[f.key],
              onChange: (e) => setField(f.key, e.target.value),
              onBlur: () => onBlurField(f.key),
            };
            return (
              <div key={f.key}>
                <label style={styles_.label} htmlFor={f.key}>{t[f.label]}</label>
                {f.textarea ? <textarea {...props} /> : <input {...props} />}
                {errors[f.key] && <p style={styles_.error}>{errors[f.key]}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}