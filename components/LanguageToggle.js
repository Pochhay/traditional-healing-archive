"use client";

import { useLanguage } from "./LanguageProvider.js";

const styles = {
  wrap: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#18221D",
    border: "1px solid #2D4A3E",
    borderRadius: 20,
    padding: "2px 4px",
    gap: 2,
  },
  btn: {
    background: "transparent",
    border: "none",
    color: "#86B29B",
    fontSize: 12,
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  active: {
    backgroundColor: "#232C27",
    color: "#B2D095",
    border: "1px solid #2D4A3E",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

export default function LanguageToggle({ lang, onToggle }) {
  const { lang: ctxLang, setLang: ctxSetLang } = useLanguage();
  // Props win when passed; otherwise the context makes this drop-in anywhere.
  const activeLang = lang ?? ctxLang;
  const toggle = onToggle ?? ctxSetLang;
  return (
    <div style={styles.wrap} role="group" aria-label="Language selector">
      <button
        type="button"
        style={activeLang === "km" ? styles.active : styles.btn}
        onClick={() => toggle("km")}
      >
        ភាសាខ្មែរ
      </button>
      <button
        type="button"
        style={activeLang === "en" ? styles.active : styles.btn}
        onClick={() => toggle("en")}
      >
        English
      </button>
    </div>
  );
}
