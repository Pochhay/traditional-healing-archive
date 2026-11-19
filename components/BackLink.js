"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

export default function BackLink({ subtle = false }) {
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const label = t.backToArchive.replace(/^←\s*/, "");

  return (
    <Link href="/" className={subtle ? "back-btn back-btn-subtle" : "back-btn"}>
      <svg
        className="back-btn-arrow"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 3.5L5.5 8L10 12.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
