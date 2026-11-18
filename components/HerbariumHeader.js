"use client";

import collection from "../collection.config.js";
import AuthNav from "./AuthNav.js";
import LanguageToggle from "./LanguageToggle.js";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const makeStyles = (km) => ({
  header: { padding: "40px 0 20px", display: "flex", flexDirection: "column", gap: 16 },
  topRow: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    gap: 12, flexWrap: "wrap",
  },
  plaque: {
    display: "flex", flexDirection: "column", gap: 2, width: "fit-content",
    backgroundColor: "#141D19", border: "1px solid #2D4A3E", borderLeft: "3px solid #B2D095",
    borderRadius: 4, padding: "8px 14px",
  },
  plaqueKh: { fontSize: 14, fontWeight: 600, color: "#B2D095", letterSpacing: 0, lineHeight: 1.4 },
  plaqueEn: {
    fontSize: 10, fontWeight: 500, color: "#86B29B",
    letterSpacing: 1.6, textTransform: "uppercase", lineHeight: 1.3,
  },
  divider: { borderTop: "1px solid #232C27" },
  title: { fontSize: 36, fontWeight: 500, color: "#A3D1B8", margin: "4px 0 2px", letterSpacing: km ? 0 : -0.5 },
  titleKhmer: { fontSize: 20, color: "#B2D095", fontWeight: 500, margin: "0 0 10px" },
  desc: { fontSize: 15, color: "#C1C8C2", lineHeight: 1.7, margin: 0 },
  metaStack: { display: "flex", flexDirection: "column", gap: 12, marginTop: 6 },
  authRow: { display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 10 },
  metaCard: {
    backgroundColor: "#18221D", border: "1px solid #2D4A3E",
    padding: "12px 16px", borderRadius: 4,
  },
  metaLabel: {
    fontSize: 11, letterSpacing: km ? 0 : 1.5, color: "#A3D1B8",
    textTransform: km ? "none" : "uppercase", margin: 0,
  },
  metaValue: { fontSize: 14, color: "#DBE5DE", margin: "4px 0 0", lineHeight: 1.5 },
});

export default function HerbariumHeader({ lang: langProp, onToggleLang }) {
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const styles = makeStyles(lang === "km");
  return (
    <header style={styles.header}>
      <div style={styles.topRow}>
        <div style={styles.plaque}>
          <span style={styles.plaqueKh}>{UI_TRANSLATIONS.km.badge}</span>
          <span style={styles.plaqueEn}>{UI_TRANSLATIONS.en.badge}</span>
        </div>
        <LanguageToggle lang={lang} onToggle={onToggleLang} />
      </div>
      <div style={styles.authRow}><AuthNav /></div>
      <div style={styles.divider} />
      <div>
        <h1 style={styles.title}>{lang === "km" ? collection.nameKm : collection.name}</h1>
        <p style={styles.titleKhmer}>{lang === "km" ? collection.name : collection.nameKm}</p>
        <p style={styles.desc}>{lang === "km" ? collection.descriptionKm : collection.description}</p>
      </div>
      <div style={styles.metaStack}>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>{t.curator}</p>
          <p style={styles.metaValue}>{lang === "km" ? collection.curatorKm : collection.curator}</p>
        </div>
        <div style={styles.metaCard}>
          <p style={styles.metaLabel}>{t.source}</p>
          <p style={styles.metaValue}>{lang === "km" ? collection.sourceKm : collection.source}</p>
        </div>
      </div>
    </header>
  );
}
