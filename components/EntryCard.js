import React from "react";
import SpecimenDetails from "./SpecimenDetails.js";
import EntryActions from "./EntryActions.js";
import HighlightText from "./HighlightText.js";
import { UI_TRANSLATIONS } from "../utils/translations.js";
import { useLanguage } from "./LanguageProvider.js";
import collection from "../collection.config.js";

const styles = {
  card: {
    backgroundColor: "#16221D", border: "1px solid #2D4A3E",
    borderRadius: 4, padding: 18, display: "flex", flexDirection: "column", gap: 14,
  },
  ribbon: {
    display: "flex", flexWrap: "wrap", alignItems: "center",
    justifyContent: "space-between", gap: 8, paddingBottom: 10,
    borderBottom: "1px solid #232C27",
  },
  familyBadge: {
    fontSize: 11, color: "#B2D095", backgroundColor: "#232C27",
    border: "1px solid #2D4A3E", padding: "2px 8px", borderRadius: 3,
    fontWeight: 500,
  },
  body: { display: "flex", flexWrap: "wrap", gap: 18 },
  photoPane: { flex: "1 1 240px", maxWidth: 300, display: "flex", flexDirection: "column", gap: 8 },
  photo: {
    width: "100%", height: 210, objectFit: "cover", borderRadius: 3,
    border: "1px solid #2D4A3E", backgroundColor: "#0C1511",
  },
  habitatBox: {
    backgroundColor: "#141D19", border: "1px solid #232C27",
    padding: "8px 10px", borderRadius: 3, fontSize: 12, color: "#9EB3A6", lineHeight: 1.4,
  },
  habitatLabel: {
    fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 10.5,
    letterSpacing: 1, color: "#86B29B", textTransform: "uppercase", margin: "0 0 2px",
  },
};

export default function EntryCard({ entry, user, onDelete, query = "", lang: langProp }) {
  const { family, image, nameEnglish, nameKhmer, location, owner, contributor = collection.curator } = entry;
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const t = UI_TRANSLATIONS[lang] ?? UI_TRANSLATIONS.en;
  const isOwner = user && user.id === owner;
  return (
    <article className="entry-card" style={styles.card}>
      <div style={styles.ribbon}>
        <span style={{ fontSize: 11, color: "#86B29B", letterSpacing: lang === "km" ? 0 : 0.5 }}>{t.contributorBy}: {contributor}</span>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {isOwner && <EntryActions entry={entry} onDelete={onDelete} />}
          <span style={styles.familyBadge}>{t.familyLabel}: <HighlightText text={family} query={query} /></span>
        </div>
      </div>
      <div style={styles.body}>
        <div className="entry-photo-pane" style={styles.photoPane}>
          {image && (
            <img src={image} alt={`${nameEnglish} (${nameKhmer})`} className="entry-photo" style={styles.photo} />
          )}
          {location && (
            <div style={styles.habitatBox}>
              <p style={{ ...styles.habitatLabel, letterSpacing: lang === "km" ? 0 : 1, textTransform: lang === "km" ? "none" : "uppercase" }}>{t.habitatLabel}</p>
              <span><HighlightText text={location} query={query} /></span>
            </div>
          )}
        </div>
        <SpecimenDetails entry={entry} query={query} lang={lang} />
      </div>
    </article>
  );
}
