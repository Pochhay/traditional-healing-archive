"use client";

import collection from "../collection.config.js";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const makeStyles = (km) => ({
  title: {
    fontSize: 32, fontWeight: 600, color: "#B4DBC4",
    lineHeight: 1.25, letterSpacing: km ? 0 : -0.5, margin: 0,
  },
  titleSub: { fontSize: 16, fontWeight: 500, color: "#86B29B", margin: "3px 0 8px" },
  desc: { fontSize: 14, color: "#B8C5BD", lineHeight: 1.65, margin: 0, maxWidth: "74ch" },
  metaLabel: {
    fontSize: 11, letterSpacing: km ? 0 : 1.3, color: "#789C88",
    textTransform: km ? "none" : "uppercase", margin: 0,
  },
  metaValue: { fontSize: 13.5, fontWeight: 500, color: "#DBE5DE", margin: "3px 0 0" },
  metaSource: { fontSize: 13.5, color: "#B2C2B8", lineHeight: 1.55, margin: "3px 0 0" },
});

export default function HerbariumHeader({ lang: langProp }) {
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const styles = makeStyles(lang === "km");
  return (
    <header className="hdr-header">
      <div className="hdr-hero">
        <h1 className="hdr-title" style={styles.title}>{lang === "km" ? collection.nameKm : collection.name}</h1>
        <p className="hdr-title-sub" style={styles.titleSub}>{lang === "km" ? collection.name : collection.nameKm}</p>
        <p style={styles.desc}>{lang === "km" ? collection.descriptionKm : collection.description}</p>
      </div>
      <div className="hdr-meta">
        <div>
          <p style={styles.metaLabel}>{t.curator}</p>
          <p style={styles.metaValue}>{lang === "km" ? collection.curatorKm : collection.curator}</p>
        </div>
        <div className="hdr-meta-source">
          <p style={styles.metaLabel}>{t.source}</p>
          <p style={styles.metaSource}>{lang === "km" ? collection.sourceKm : collection.source}</p>
        </div>
      </div>
    </header>
  );
}
