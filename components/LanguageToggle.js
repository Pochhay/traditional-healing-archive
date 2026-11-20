"use client";

import { useLanguage } from "./LanguageProvider.js";

const styles = {
  wrap: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#0A130E",
    border: "1px solid #2D483B",
    borderRadius: 6,
    padding: 2,
    gap: 2,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.28)",
  },
  btn: {
    background: "transparent",
    border: "1px solid transparent",
    color: "#9FC6B0",
    fontSize: 12,
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    transition: "color 0.15s ease",
  },
  active: {
    backgroundColor: "#1F362A",
    border: "1px solid #4A7660",
    color: "#E2F9CA",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
};

export default function LanguageToggle({ lang, onToggle }) {
  const { lang: ctxLang, setLang: ctxSetLang } = useLanguage();
  // Props win when passed; otherwise the context makes this drop-in anywhere.
  const activeLang = lang ?? ctxLang;
  const toggle = onToggle ?? ctxSetLang;
  return (
    <div className="lang-toggle" style={styles.wrap} role="group" aria-label="Language selector">
      <button type="button" className="lang-btn" style={activeLang === "km" ? styles.active : styles.btn} onClick={() => toggle("km")}>
        ភាសាខ្មែរ
      </button>
      <button type="button" className="lang-btn" style={activeLang === "en" ? styles.active : styles.btn} onClick={() => toggle("en")}>
        English
      </button>
    </div>
  );
}
