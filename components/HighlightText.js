// Wraps every case-insensitive match of `query` inside `text` in a <mark> pill.
// Splitting on a captured group keeps the original characters intact, so Khmer
// clusters are never sliced apart — matches are matched, everything else is untouched.
const styles = {
  mark: {
    backgroundColor: "rgba(178, 208, 149, 0.26)",
    color: "#EAFFD9",
    borderBottom: "1px solid #B2D095",
    borderRadius: 2,
    padding: "0 1px",
  },
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function HighlightText({ text, query }) {
  if (typeof text !== "string" || !text) return text ?? "";
  const term = (query ?? "").trim();
  if (!term) return text; // No query: return the bare string, no wrapper DOM.

  let parts;
  try {
    parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "giu"));
  } catch {
    return text; // Unsplittable pattern: render plain rather than crash.
  }
  if (parts.length < 2) return text;

  // split() with one capture group alternates: [plain, match, plain, match…]
  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i} style={styles.mark}>{part}</mark> : part
  );
}