"use client";

import { useState } from "react";

const styles = {
  wrap: {
    backgroundColor: "#07100C", border: "1px solid #2D4A3E", borderRadius: 4,
    padding: "8px", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
  },
  tag: {
    display: "inline-flex", alignItems: "center", gap: 4,
    backgroundColor: "rgba(200, 230, 169, 0.1)", border: "1px solid rgba(200, 230, 169, 0.3)",
    color: "#C8E6A9", fontSize: 12, padding: "3px 8px", borderRadius: 3,
  },
  x: {
    background: "none", border: "none", color: "#86B29B", cursor: "pointer",
    padding: 0, fontSize: 14, lineHeight: 1, fontFamily: "inherit",
  },
  input: {
    flex: "1 1 120px", background: "none", border: "none", outline: "none",
    color: "#DBE5DE", fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "4px",
  },
  limit: { width: "100%", margin: "4px 0 0", fontSize: 12, color: "#FFB4AB" },
};

export default function TagInput({ value = [], onChange, placeholder = "Add compound, press Enter", disabled = false, maxTags = 100 }) {
  const [draft, setDraft] = useState("");

  function addTag(raw) {
    const tag = raw.trim();
    if (!tag || value.length >= maxTags || value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(i) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function onKeyDown(e) {
    if (e.key === "Enter" || e.key === ";") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  return (
    <div>
      <div style={styles.wrap}>
        {value.map((t, i) => (
          <span key={`${t}-${i}`} style={styles.tag}>
            {t}
            <button type="button" onClick={() => removeTag(i)} aria-label={`Remove ${t}`} style={styles.x}>×</button>
          </span>
        ))}
        <input
          style={styles.input}
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(draft)}
        />
      </div>
      {value.length >= maxTags && <p style={styles.limit}>Maximum of {maxTags} compounds reached.</p>}
    </div>
  );
}