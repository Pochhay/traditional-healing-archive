"use client";

import { useEffect, useState } from "react";
import HerbariumHeader from "../components/HerbariumHeader.js";
import SearchFilter from "../components/SearchFilter.js";
import EntryCard from "../components/EntryCard.js";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

// Map a database row to the shape EntryCard / SpecimenDetails expect.
function mapEntry(row) {
  return {
    id: row.id,
    nameEnglish: row.title,
    nameKhmer: row.name_khmer,
    scientificName: row.scientific_name,
    family: row.family,
    location: row.habitat,
    caution: row.caution,
    image: row.photo_url,
    description: row.description,
    dosage: row.dosage,
    medicinalUses: row.medicinal_uses ? row.medicinal_uses.split("\n").filter(Boolean) : [],
    chemicalCompounds: row.chemical_compounds ? row.chemical_compounds.split(",").map((c) => c.trim()).filter(Boolean) : [],
  };
}

const styles = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: "0 20px 80px", display: "flex", flexDirection: "column", gap: 24 },
  grid: { display: "flex", flexDirection: "column", gap: 24 },
  empty: {
    backgroundColor: "#18221D", border: "1px dashed #2D4A3E", borderRadius: 4, padding: "48px 24px",
    textAlign: "center", color: "#86B29B", fontSize: 15, display: "flex", flexDirection: "column", gap: 6,
  },
  status: {
    backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "48px 24px",
    textAlign: "center", fontSize: 15, display: "flex", flexDirection: "column", gap: 6,
  },
  error: { color: "#FFB4AB" },
  loading: { color: "#86B29B" },
  footer: {
    marginTop: 32, paddingTop: 20, borderTop: "1px solid #232C27", fontSize: 13, color: "#86B29B",
    textAlign: "center", fontFamily: "'EB Garamond', Georgia, serif",
  },
};

export default function Home() {
  const [entries, setEntries] = useState(null); // null = still loading
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeField, setActiveField] = useState("all");

  useEffect(() => {
    supabase.from("entries").select("*").order("created_at", { ascending: false }).then(({ data, error: fetchError }) => {
      if (fetchError) return setError("Could not load the archive. Please try again later.");
      setEntries(data.map(mapEntry));
    });
  }, []);
  const q = query.toLowerCase().trim();
  const filtered = (entries ?? []).filter((entry) => {
    if (!q) return true;
    const match = (v) => typeof v === "string" && v.toLowerCase().includes(q);
    const matchArr = (a) => Array.isArray(a) && a.some((i) => typeof i === "string" && i.toLowerCase().includes(q));
    if (activeField === "name") return match(entry.nameKhmer) || match(entry.nameEnglish) || match(entry.scientificName);
    if (activeField === "family") return match(entry.family);
    if (activeField === "uses") return matchArr(entry.medicinalUses);
    if (activeField === "compounds") return matchArr(entry.chemicalCompounds);
    if (activeField === "location") return match(entry.location);
    const fields = ["nameKhmer", "nameEnglish", "scientificName", "family", "description", "location", "dosage", "caution"];
    return fields.some((f) => match(entry[f])) || matchArr(entry.chemicalCompounds) || matchArr(entry.medicinalUses);
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
        totalCount={(entries ?? []).length}
      />
      <div style={styles.grid}>
        {error ? (
          <div style={{ ...styles.status, ...styles.error }}>
            <span style={{ fontSize: 18 }}>សុំទោស — បញ្ហាបញ្ចូលទិន្នន័យ</span>
            <span>{error}</span>
          </div>
        ) : entries === null ? (
          <div style={{ ...styles.status, ...styles.loading }}>
            <span style={{ fontSize: 18, color: "#B2D095" }}>កំពុងទាញយកទិន្នន័យ…</span>
            <span style={{ color: "#86B29B" }}>Loading specimen records from the archive…</span>
          </div>
        ) : filtered.length > 0 ? (
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