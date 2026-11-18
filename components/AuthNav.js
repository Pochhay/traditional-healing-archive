"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../utils/supabase/client";
import { useLanguage } from "./LanguageProvider.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";

const supabase = createClient();

const styles = {
  nav: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  email: { fontSize: 12, color: "#86B29B" },
  chip: {
    fontSize: 12, color: "#DBE5DE", textDecoration: "none", padding: "4px 12px",
    backgroundColor: "#232C27", border: "1px solid #2D4A3E", borderRadius: 4,
    fontWeight: 500,
  },
  chipPrimary: {
    fontSize: 12, color: "#B2D095", textDecoration: "none", padding: "4px 12px",
    backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4,
    fontWeight: 600,
  },
  button: {
    fontSize: 12, color: "#DBE5DE", backgroundColor: "#232C27", border: "1px solid #2D4A3E",
    borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit",
  },
};

export default function AuthNav() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const [email, setEmail] = useState(undefined); // undefined = checking, null = logged out
  const [reviewer, setReviewer] = useState(false);
  const [hover, setHover] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    supabase.rpc("is_reviewer").then(({ data }) => setReviewer(data === true));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const hoverProps = (id, base) => ({
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(""),
    style: { ...base, color: hover === id ? "#C8E6A9" : base.color },
  });

  if (email === undefined) return null;

  return (
    <nav style={styles.nav}>
      {email ? (
        <>
          <Link href="/contribute" {...hoverProps("contribute", styles.chipPrimary)}>{t.navContribute}</Link>
          <Link href="/my-entries" {...hoverProps("myentries", styles.chip)}>{t.navMyEntries}</Link>
          {reviewer && <Link href="/review" {...hoverProps("review", styles.chip)}>{t.navReview}</Link>}
          <span style={styles.email}>{email}</span>
          <button type="button" onClick={handleLogout} {...hoverProps("logout", styles.button)}>{t.navLogout}</button>
        </>
      ) : (
        <>
          <Link href="/login" {...hoverProps("signin", styles.chip)}>{t.navSignIn}</Link>
          <Link href="/signup" {...hoverProps("signup", styles.chipPrimary)}>{t.navSignUp}</Link>
        </>
      )}
    </nav>
  );
}