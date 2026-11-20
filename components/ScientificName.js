import HighlightText from "./HighlightText.js";

const RANKS = new Set(["var.", "subsp.", "ssp.", "f.", "fo.", "cv.", "sect."]);
const NON_ITALIC = new Set(["sp.", "spp.", "cf.", "aff.", "×", "x", "sensu", "s.l.", "s.str."]);

// Split a botanical name into italic (genus/epithets) and upright (ranks/authors) segments
// following ICN binomial formatting rules, e.g. *Barleria lupulina* Lindl.
function segmentName(name) {
  const tokens = String(name || "").trim().split(/\s+/).filter(Boolean);
  const parts = [];
  let inAuthor = false;

  tokens.forEach((tok, i) => {
    const lower = tok.toLowerCase();
    let italic = false;
    if (i === 0) {
      italic = !NON_ITALIC.has(lower);
    } else if (RANKS.has(lower)) {
      italic = false;
      inAuthor = false;
    } else if (NON_ITALIC.has(lower)) {
      italic = false;
    } else if (!inAuthor && /^[a-zà-ÿ]/.test(tok)) {
      italic = true;
    } else {
      inAuthor = true;
    }
    const prev = parts[parts.length - 1];
    if (prev && prev.italic === italic) {
      prev.text += ` ${tok}`;
    } else {
      parts.push({ text: parts.length ? ` ${tok}` : tok, italic });
    }
  });
  return parts;
}

export default function ScientificName({ name, query = "" }) {
  if (!name) return null;
  return segmentName(name).map((seg, i) =>
    seg.italic ? (
      <em key={i} style={{ fontStyle: "italic" }}><HighlightText text={seg.text} query={query} /></em>
    ) : (
      <span key={i} style={{ fontStyle: "normal" }}><HighlightText text={seg.text} query={query} /></span>
    )
  );
}
