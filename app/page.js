"use client";

import { useState } from "react";
import collection from "../collection.config.js";
import entries from "../data/entries.js";
import EntryCard from "../components/EntryCard.js";

const SEARCH_FIELDS = {
  all: ["nameKhmer", "nameEnglish", "scientificName", "family", "description", "location", "partsUsed", "dosage", "caution", "chemicalCompounds", "medicinalUses"],
  scoped: [
    { key: "name", label: "Name", props: ["nameKhmer", "nameEnglish", "scientificName"] },
    { key: "family", label: "Family", props: ["family"] },
    { key: "uses", label: "Uses", props: ["medicinalUses"] },
    { key: "compounds", label: "Compounds", props: ["chemicalCompounds"] },
    { key: "location", label: "Location", props: ["location"] },
  ],
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeFields, setActiveFields] = useState([]);

  const lowerQuery = query.toLowerCase().trim();

  const filterEntries = (entry) => {
    if (!lowerQuery) return true;

    const matchField = (val) =>
      typeof val === "string" && val.toLowerCase().includes(lowerQuery);

    const matchArray = (arr) =>
      Array.isArray(arr) &&
      arr.some((item) => typeof item === "string" && item.toLowerCase().includes(lowerQuery));

    const matchProp = (prop) =>
      Array.isArray(entry[prop]) ? matchArray(entry[prop]) : matchField(entry[prop]);

    if (activeFields.length === 0) {
      return SEARCH_FIELDS.all.some(matchProp);
    }

    return SEARCH_FIELDS.scoped
      .filter(({ key }) => activeFields.includes(key))
      .some(({ props }) => props.some(matchProp));
  };

  const filteredEntries = entries.filter(filterEntries);

  const totalEntries = entries.length;
  const resultCount = filteredEntries.length;
  const isSearching = lowerQuery !== "";
  const isScoped = activeFields.length > 0;

  const toggleField = (key) =>
    setActiveFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );

  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER HERBAL PLANT ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      <div style={styles.card}>
        <p style={styles.cardLabel}>CURATED BY</p>
        <p style={styles.cardValue}>{collection.curator}</p>
      </div>
      <div style={styles.card}>
        <p style={styles.cardLabel}>SOURCE</p>
        <p style={styles.cardValue}>{collection.source}</p>
      </div>

      <label style={styles.searchLabel} htmlFor="archive-search">
        SEARCH / ស្វែងរក
      </label>
      <input
        type="text"
        id="archive-search"
        placeholder="Type to search name, family, uses, compounds..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.searchInput}
      />

      <p style={styles.filterLabel}>FILTER:</p>
      <div style={styles.filterRow}>
        <button
          type="button"
          style={activeFields.length === 0 ? styles.pillActive : styles.pill}
          onClick={() => setActiveFields([])}
        >
          All
        </button>
        {SEARCH_FIELDS.scoped.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            style={activeFields.includes(key) ? styles.pillActive : styles.pill}
            onClick={() => toggleField(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {isSearching ? (
        <p style={styles.count}>
          {resultCount} result{resultCount !== 1 ? "s" : ""}
          {isScoped
            ? " in " +
              SEARCH_FIELDS.scoped
                .filter(({ key }) => activeFields.includes(key))
                .map(({ label }) => label)
                .join(" / ") +
              " found"
            : " found"}{" "}
          for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <p style={styles.count}>entries in the archive: {totalEntries}</p>
      )}

      <div style={{ display: "grid", gap: 24 }}>
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        ) : (
          <div style={styles.emptyState}>
            រកមិនឃើញរុក្ខជាតិឱសថទេ / No medicinal plants found
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
        2026.
      </footer>
    </main>
  );
}

const styles = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "80px 24px",
  },
  kicker: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    color: "#86B29B",
    fontSize: 15,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    color: "#E8ECE9",
    margin: "16px 0 12px",
    lineHeight: 1.1,
  },
  description: {
    fontSize: 19,
    color: "#E8ECE9",
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    marginTop: 48,
    padding: 24,
    backgroundColor: "#16221D",
    border: "1px solid #2D4A3E",
    borderLeft: "3px solid #86B29B",
    borderRadius: 10,
  },
  cardLabel: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 13,
    color: "#86B29B",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 17,
    color: "#E8ECE9",
    margin: "6px 0 0",
  },
  searchLabel: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 13,
    color: "#86B29B",
    marginTop: 32,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#16221D",
    border: "1px solid #2D4A3E",
    borderRadius: 8,
    color: "#E8ECE9",
    fontSize: 16,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
  },
  filterLabel: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 12,
    color: "#86B29B",
    marginTop: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  pill: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 14,
    backgroundColor: "#16221D",
    border: "1px solid #2D4A3E",
    color: "#86B29B",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  pillActive: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 14,
    backgroundColor: "#2D4A3E",
    border: "1px solid #86B29B",
    color: "#C8E6A9",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  count: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontSize: 15,
    color: "#86B29B",
    marginTop: 24,
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "48px 24px",
    color: "#86B29B",
    fontSize: 18,
    lineHeight: 1.6,
    border: "1px dashed #2D4A3E",
    borderRadius: 10,
    backgroundColor: "#16221D",
  },
  footer: {
    marginTop: 64,
    paddingTop: 24,
    borderTop: "1px solid #2D4A3E",
    fontSize: 14,
    color: "#86B29B",
  },
};