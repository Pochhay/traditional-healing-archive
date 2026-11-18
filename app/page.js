"use client";

import { useEffect, useState } from "react";
import HerbariumHeader from "../components/HerbariumHeader.js";
import SearchFilter from "../components/SearchFilter.js";
import EntryCard from "../components/EntryCard.js";
import PaginationControls from "../components/PaginationControls.js";
import { KHMER_SPECIMEN_DATA } from "../data/khmerEntries.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";
import { useLanguage } from "../components/LanguageProvider.js";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();
const PAGE_SIZE = 6;

// Map a raw database row to the shape EntryCard / SpecimenDetails expect. In Khmer
// mode, transcribed Plant_entry text from data/khmerEntries.js overrides the DB copy;
// anything not transcribed (community entries) falls back to the English row.
function mapEntry(row, currentLang) {
  const kmFallback = KHMER_SPECIMEN_DATA[row.scientific_name?.trim()];
  const isKm = currentLang === "km";
  const dbUses = row.medicinal_uses ? row.medicinal_uses.split("\n").filter(Boolean) : [];
  const kmUses = row.medicinal_uses_km ? row.medicinal_uses_km.split("\n").filter(Boolean) : null;
  return {
    id: row.id,
    owner: row.owner,
    contributor: row.contributor,
    nameEnglish: row.title,
    scientificName: row.scientific_name,
    family: row.family,
    image: row.photo_url,
    chemicalCompounds: row.chemical_compounds ? row.chemical_compounds.split(",").map((c) => c.trim()).filter(Boolean) : [],
    nameKhmer: (isKm && kmFallback?.nameKhmer) || row.name_khmer,
    // Khmer priority: submitted *_km → Plant_entry transcription → English DB row.
    description: isKm ? row.description_km || kmFallback?.description || row.description : row.description,
    location: isKm ? row.habitat_km || kmFallback?.location || row.habitat : row.habitat,
    dosage: isKm ? row.dosage_km || kmFallback?.dosage || row.dosage : row.dosage,
    caution: isKm ? row.caution_km || kmFallback?.caution || row.caution : row.caution, // never hide a warning
    medicinalUses: isKm ? kmUses || kmFallback?.medicinalUses || dbUses : dbUses,
    partsUsed: isKm ? row.parts_used_km || kmFallback?.partsUsed || null : null,
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
    textAlign: "center", fontFamily: "'Kantumruy Pro', sans-serif",
  },
};

export default function Home() {
  const [rows, setRows] = useState(null); // null = still loading
  const [error, setError] = useState(false); // boolean: message comes from t.loadError
  const [query, setQuery] = useState("");
  const [activeField, setActiveField] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { lang } = useLanguage(); // shared with every page via LanguageProvider
  const [user, setUser] = useState(null);

  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const entries = rows ? rows.map((r) => mapEntry(r, lang)) : null;
  const removeEntry = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  // Any new query or filter change restarts the feed at page 1 (same tick, no flash).
  const setQueryAndReset = (value) => { setQuery(value); setVisible(PAGE_SIZE); };
  const setFieldAndReset = (value) => { setActiveField(value); setVisible(PAGE_SIZE); };
  useEffect(() => {
    supabase.from("entries").select("*").eq("status", "published").order("created_at", { ascending: false }).then(({ data, error: fetchError }) => {
      if (fetchError) return setError(true); // rendered as t.loadError in the active language
      setRows(data); // raw rows: mapped per language at render time, never re-fetched
    });
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
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
    const fields = ["nameKhmer", "nameEnglish", "scientificName", "family", "description", "location", "dosage", "caution", "partsUsed"];
    return fields.some((f) => match(entry[f])) || matchArr(entry.chemicalCompounds) || matchArr(entry.medicinalUses);
  });
  const shown = filtered.slice(0, visible);

  return (
    <main style={styles.wrap}>
      <HerbariumHeader />
      <SearchFilter
        lang={lang}
        query={query}
        setQuery={setQueryAndReset}
        activeField={activeField}
        setActiveField={setFieldAndReset}
        resultCount={filtered.length}
        totalCount={(entries ?? []).length}
      />
      <div style={styles.grid}>
        {error ? (
          <div style={{ ...styles.status, ...styles.error }}>
            <span style={{ fontSize: 18 }}>{t.errorTitle}</span>
            <span>{t.loadError}</span>
          </div>
        ) : entries === null ? (
          <div style={{ ...styles.status, ...styles.loading }}>
            <span style={{ fontSize: 18, color: "#B2D095" }}>{t.loadingTitle}</span>
            <span style={{ color: "#86B29B" }}>{t.loading}</span>
          </div>
        ) : filtered.length > 0 ? (
          shown.map((entry) => <EntryCard key={entry.id} entry={entry} user={user} onDelete={removeEntry} query={q} lang={lang} />)
        ) : (
          <div style={styles.empty}>
            <span style={{ fontSize: 18, color: "#B2D095" }}>{t.emptyTitle}</span>
            <span>{t.emptyDesc}</span>
          </div>
        )}
      </div>
      {!error && filtered.length > 0 && (
        <PaginationControls total={filtered.length} visible={shown.length} lang={lang}
          onLoadMore={() => setVisible((v) => v + PAGE_SIZE)} />
      )}
      <footer style={{ ...styles.footer, letterSpacing: lang === "km" ? 0 : 0.3 }}>{t.footer}</footer>
    </main>
  );
}