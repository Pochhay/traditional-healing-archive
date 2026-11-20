"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNav from "./AuthNav.js";
import LanguageToggle from "./LanguageToggle.js";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const styles = {
  brandKh: { fontSize: 13, fontWeight: 600, color: "#B2D095", letterSpacing: 0, lineHeight: 1.35 },
  brandEn: {
    fontSize: 9.5, fontWeight: 500, color: "#789C88",
    letterSpacing: 1.2, textTransform: "uppercase", lineHeight: 1.25,
  },
};

export default function SiteHeader() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleDrawerClick = (e) => {
    if (e.target.closest("a")) setMenuOpen(false);
  };

  return (
    <div className="site-nav">
      <div className="site-nav-inner">
        <div className="hdr-top">
          <Link href="/" className="hdr-brand" onClick={() => setMenuOpen(false)}>
            <span className="hdr-brand-kh" style={styles.brandKh}>{UI_TRANSLATIONS.km.badge}</span>
            <span className="hdr-brand-en" style={styles.brandEn}>{UI_TRANSLATIONS.en.badge}</span>
          </Link>
          <div className={menuOpen ? "hdr-drawer hdr-drawer-open" : "hdr-drawer"} onClick={handleDrawerClick}>
            <div className="hdr-auth"><AuthNav /></div>
          </div>
          <div className="hdr-controls">
            <div className="hdr-lang"><LanguageToggle /></div>
            <button
              type="button"
              className="hdr-menu-btn"
              aria-label={t.menuLabel}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="M2.5 5H15.5M2.5 9H15.5M2.5 13H15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
