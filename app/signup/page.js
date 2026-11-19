"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import BackLink from "../../components/BackLink.js";
import { useLanguage } from "../../components/LanguageProvider.js";
import { UI_TRANSLATIONS } from "../../utils/translations.js";

const supabase = createClient();

const styles = {
  page: { minHeight: "calc(100vh - 68px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  wrap: { width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  card: { width: "100%", backgroundColor: "#141D19", border: "1px solid #24382E", borderRadius: 8, padding: "32px 28px" },
  title: { fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 26, fontWeight: 600, color: "#E8ECE9", margin: "0 0 6px" },
  subtitle: { fontSize: 14, color: "#86B29B", margin: "0 0 24px" },
  label: { display: "block", fontSize: 12, color: "#86B29B", letterSpacing: 0.5, marginBottom: 6 },
  input: {
    width: "100%", boxSizing: "border-box", backgroundColor: "#0B130F", border: "1px solid #24382E",
    borderRadius: 6, color: "#DBE5DE", fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "10px 12px", marginBottom: 16,
  },
  error: {
    backgroundColor: "rgba(255, 180, 171, 0.1)", border: "1px solid rgba(255, 180, 171, 0.3)",
    color: "#FFB4AB", borderRadius: 6, fontSize: 14, padding: "10px 12px", marginBottom: 16,
  },
  button: {
    width: "100%", backgroundColor: "#B2D095", color: "#0C1511", fontWeight: 600, border: "none",
    borderRadius: 6, cursor: "pointer", fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "12px 0", marginTop: 4,
  },
  links: { margin: "20px 0 0", fontSize: 13, color: "#86B29B", textAlign: "center" },
  link: { color: "#B2D095", fontWeight: 500, textDecoration: "none" },
};

export default function SignupPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    });
    setLoading(false);
    // Generic message only — no enumeration, no Supabase error details surfaced.
    if (signUpError) return setError(t.genericError);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="subpage-shell" style={styles.page}>
      <div style={styles.wrap}>
        <form className="subpage-card" style={styles.card} onSubmit={handleSubmit}>
          <h1 style={styles.title}>{t.signupTitle}</h1>
          <p style={styles.subtitle}>{t.signupSubtitle}</p>
          {error && <p style={styles.error}>{error}</p>}
          <label style={{ ...styles.label, letterSpacing: lang === "km" ? 0 : 0.5 }} htmlFor="username">{t.usernameLabel}</label>
          <input id="username" type="text" style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" minLength={2} maxLength={30} required />
          <label style={{ ...styles.label, letterSpacing: lang === "km" ? 0 : 0.5 }} htmlFor="email">{t.emailLabel}</label>
          <input id="email" type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <label style={{ ...styles.label, letterSpacing: lang === "km" ? 0 : 0.5 }} htmlFor="password">{t.passwordLabel}</label>
          <input id="password" type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          <button type="submit" style={styles.button} disabled={loading}>{loading ? t.creatingAccount : t.signupTitle}</button>
          <p style={styles.links}>
            {t.haveAccount} <Link href="/login" style={styles.link}>{t.navSignIn}</Link>
          </p>
        </form>
        <BackLink subtle />
      </div>
    </main>
  );
}