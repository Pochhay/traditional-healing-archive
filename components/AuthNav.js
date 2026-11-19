"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../utils/supabase/client";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const supabase = createClient();

export default function AuthNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const [email, setEmail] = useState(undefined); // undefined = checking, null = logged out
  const [reviewer, setReviewer] = useState(false);

  useEffect(() => {
    const checkReviewer = () =>
      supabase.rpc("is_reviewer").then(({ data }) => setReviewer(data === true));
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      if (data.user) checkReviewer();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      if (session?.user) checkReviewer();
      else setReviewer(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (email === undefined) return null;

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);
  const navClass = (href, base) => (isActive(href) ? `${base} nav-active` : base);
  const current = (href) => (isActive(href) ? "page" : undefined);

  return (
    <nav className="auth-nav" aria-label="Primary navigation">
      {email ? (
        <>
          <Link href="/contribute" className={navClass("/contribute", "nav-cta")} aria-current={current("/contribute")}>
            {t.navContribute}
          </Link>
          <Link href="/my-entries" className={navClass("/my-entries", "nav-link")} aria-current={current("/my-entries")}>
            {t.navMyEntries}
          </Link>
          {reviewer && (
            <Link href="/review" className={navClass("/review", "nav-link")} aria-current={current("/review")}>
              {t.navReview}
            </Link>
          )}
          <div className="nav-account">
            <span className="nav-email" title={email}>{email}</span>
            <button type="button" onClick={handleLogout} className="nav-logout">{t.navLogout}</button>
          </div>
        </>
      ) : (
        <Link href="/login" className={navClass("/login", "nav-cta")} aria-current={current("/login")}>
          {t.navSignIn}
        </Link>
      )}
    </nav>
  );
}