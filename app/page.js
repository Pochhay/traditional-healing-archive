"use client";

import { useState } from "react";
import entries from "../data/entries.js";
import HerbariumHeader from "../components/HerbariumHeader.js";
import SearchFilter from "../components/SearchFilter.js";
import EntryCard from "../components/EntryCard.js";

const styles = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: "0 20px 80px", display: "flex", flexDirection: "column", gap: 24 },
  grid: { display: "flex", flexDirection: "column", gap: 24 },
  empty: {
    backgroundColor: "#18221D", border: "1px dashed #2D4A3E", borderRadius: 4,
    padding: "48px 24px", textAlign: "center", color: "#86B29B", fontSize: 15,
    display: "flex", flexDirection: "column", gap: 6,
  },
  footer: {
    marginTop: 32, paddingTop: 20, borderTop: "1px solid #232C27",
    fontSize: 13, color: "#86B29B", textAlign: "center",
    fontFamily: "'EB Garamond', Georgia, serif",
  },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeField, setActiveField] = useState("all");

  const q = query.toLowerCase().trim();

  const filtered = entries.filter((entry) => {
    if (!q) return true;
    const match = (val) => typeof val === "string" && val.toLowerCase().includes(q);
    const matchArr = (arr) => Array.isArray(arr) && arr.some((item) => typeof item === "string" && item.toLowerCase().includes(q));

    if (activeField === "name") return match(entry.nameKhmer) || match(entry.nameEnglish) || match(entry.scientificName);
    if (activeField === "family") return match(entry.family);
    if (activeField === "uses") return matchArr(entry.medicinalUses);
    if (activeField === "compounds") return matchArr(entry.chemicalCompounds);
    if (activeField === "location") return match(entry.location);

    return (
      match(entry.nameKhmer) || match(entry.nameEnglish) || match(entry.scientificName) ||
      match(entry.family) || match(entry.description) || match(entry.location) ||
      match(entry.partsUsed) || match(entry.dosage) || match(entry.caution) ||
      matchArr(entry.chemicalCompounds) || matchArr(entry.medicinalUses)
    );
  });

  return (
    <main style={styles.wrap}>
      <HerbariumHeader />
      <SearchFilter
        query={query}
        setQuery={setQuery}
        activeField={activeField}
        setActiveField={setActiveField}
        resultCount={filtered.length}
        totalCount={entries.length}
      />
      <div style={styles.grid}>
        {filtered.length > 0 ? (
          filtered.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        ) : (
          <div style={styles.empty}>
            <span style={{ fontSize: 18, color: "#B2D095" }}>រកមិនឃើញរុក្ខជាតិឱសថទេ</span>
            <span>No medicinal plant specimens found matching your search.</span>
          </div>
        )}
      </div>
      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026.
      </footer>
    </main>
  );
}