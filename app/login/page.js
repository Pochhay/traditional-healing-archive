"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 400, backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px" },
  title: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: 28, margin: "0 0 4px" },
  subtitle: { fontSize: 14, color: "#86B29B", margin: "0 0 24px" },
  label: { display: "block", fontSize: 12, color: "#86B29B", letterSpacing: 0.5, marginBottom: 6 },
  input: {
    width: "100%", boxSizing: "border-box", backgroundColor: "#07100C", border: "1px solid #2D4A3E",
    borderRadius: 4, color: "#DBE5DE", fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "10px 12px", marginBottom: 16,
  },
  error: {
    backgroundColor: "rgba(255, 180, 171, 0.1)", border: "1px solid rgba(255, 180, 171, 0.3)",
    color: "#FFB4AB", borderRadius: 4, fontSize: 14, padding: "10px 12px", marginBottom: 16,
  },
  button: {
    width: "100%", backgroundColor: "#B2D095", color: "#0C1511", fontWeight: 600, border: "none",
    borderRadius: 4, cursor: "pointer", fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "12px 0",
  },
  links: { marginTop: 20, fontSize: 13, color: "#86B29B", textAlign: "center" },
  link: { color: "#86B29B" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    // Generic message only — never reveal whether the account exists (anti-enumeration).
    if (signInError) return setError("Invalid email or password");
    router.push("/");
    router.refresh();
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Sign in</h1>
        <p style={styles.subtitle}>ចូលប្រើបណ្ណាសារឱសថរុក្ខជាតិ</p>
        {error && <p style={styles.error}>{error}</p>}
        <label style={styles.label} htmlFor="email">Email</label>
        <input id="email" type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <label style={styles.label} htmlFor="password">Password</label>
        <input id="password" type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        <button type="submit" style={styles.button} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        <p style={styles.links}>
          Need an account? <Link href="/signup" style={styles.link}>Sign up</Link> · <Link href="/" style={styles.link}>← Back to Archive</Link>
        </p>
      </form>
    </div>
  );
}