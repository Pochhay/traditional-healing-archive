"use client";

import collection from "../collection.config.js";
import { useLanguage } from "./LanguageProvider.js";

const makeStyles = (km) => ({
  title: {
    fontSize: 32, fontWeight: 600, color: "#B4DBC4",
    lineHeight: 1.25, letterSpacing: km ? 0 : -0.5, margin: 0,
  },
  titleSub: { fontSize: 16, fontWeight: 500, color: "#86B29B", margin: "3px 0 8px" },
  desc: { fontSize: 14, color: "#B8C5BD", lineHeight: 1.65, margin: 0, maxWidth: "74ch" },
});

export default function HerbariumHeader({ lang: langProp }) {
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const styles = makeStyles(lang === "km");
  return (
    <header className="hdr-header">
      <div className="hdr-hero">
        <h1 className="hdr-title" style={styles.title}>{lang === "km" ? collection.nameKm : collection.name}</h1>
        <p className="hdr-title-sub" style={styles.titleSub}>{lang === "km" ? collection.name : collection.nameKm}</p>
        <p style={styles.desc}>{lang === "km" ? collection.descriptionKm : collection.description}</p>
      </div>
    </header>
  );
}
