"use client";

import collection from "../collection.config.js";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const makeStyles = (km) => ({
  label: {
    fontSize: 10.5, fontWeight: 600, letterSpacing: km ? 0 : 1.2,
    color: "#6F937F", textTransform: km ? "none" : "uppercase", margin: 0,
  },
  value: { fontSize: 13.5, fontWeight: 500, color: "#DBE5DE", margin: "4px 0 0" },
  source: { fontSize: 13, color: "#9EB3A6", lineHeight: 1.6, margin: "4px 0 0", maxWidth: "62ch" },
  credit: {
    margin: 0, paddingTop: 14, borderTop: "1px solid #18251F",
    fontSize: 12, color: "#6F937F", lineHeight: 1.5,
    letterSpacing: km ? 0 : 0.2,
  },
});

export default function ArchiveFooter() {
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const styles = makeStyles(lang === "km");

  return (
    <footer className="archive-footer">
      <div className="archive-footer-grid">
        <div>
          <p style={styles.label}>{t.curator}</p>
          <p style={styles.value}>{lang === "km" ? collection.curatorKm : collection.curator}</p>
        </div>
        <div>
          <p style={styles.label}>{t.source}</p>
          <p style={styles.source}>{lang === "km" ? collection.sourceKm : collection.source}</p>
        </div>
      </div>
      <p style={styles.credit}>{t.footer}</p>
    </footer>
  );
}
