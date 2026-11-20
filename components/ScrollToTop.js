"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

export default function ScrollToTop() {
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-top-btn"
      aria-label={t.backToTop}
      title={t.backToTop}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3.5 10L8 5.5L12.5 10"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
