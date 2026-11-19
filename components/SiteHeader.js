"use client";

import Link from "next/link";
import AuthNav from "./AuthNav.js";
import LanguageToggle from "./LanguageToggle.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const styles = {
  brandKh: { fontSize: 13, fontWeight: 600, color: "#B2D095", letterSpacing: 0, lineHeight: 1.35 },
  brandEn: {
    fontSize: 9.5, fontWeight: 500, color: "#789C88",
    letterSpacing: 1.2, textTransform: "uppercase", lineHeight: 1.25,
  },
};

export default function SiteHeader() {
  return (
    <div className="site-nav">
      <div className="site-nav-inner">
        <div className="hdr-top">
          <Link href="/" className="hdr-brand">
            <span className="hdr-brand-kh" style={styles.brandKh}>{UI_TRANSLATIONS.km.badge}</span>
            <span className="hdr-brand-en" style={styles.brandEn}>{UI_TRANSLATIONS.en.badge}</span>
          </Link>
          <div className="hdr-auth"><AuthNav /></div>
          <div className="hdr-lang"><LanguageToggle /></div>
        </div>
      </div>
    </div>
  );
}
