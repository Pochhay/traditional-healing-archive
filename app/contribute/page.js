"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

const MAX_PHOTO_BYTES = 5242880; // 5 MiB
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TRADITIONAL_FAMILIES = [
  "Compositae", "Leguminosae", "Umbelliferae", "Cruciferae",
  "Labiatae", "Guttiferae", "Palmae", "Gramineae",
];

/* ---------- Global hygiene ---------- */

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/^[\s\u200B-\u200D\uFEFF]+|[\s\u200B-\u200D\uFEFF]+$/g, "");
}

const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const TAG_LIKE_RE = /<[a-zA-Z/!?]/;
const LETTER_RE = /\p{L}/gu;

const codepoints = (s) => Array.from(s).length;
const countLetters = (s) => (s.match(LETTER_RE) || []).length;
const distinctLetters = (s) =>
  new Set((s.match(LETTER_RE) || []).map((c) => c.toLowerCase())).size;

// Single-line fields reject newlines and collapse inner whitespace.
function cleanSingle(raw) {
  let value = normalizeText(raw);
  if (/[\n\r]/.test(value)) return { error: "This field must be a single line." };
  value = value.replace(/[ \t]+/g, " ");
  if (CONTROL_RE.test(value)) return { error: "Control characters are not allowed." };
  if (TAG_LIKE_RE.test(value)) return { error: "Tag-like text (< ...) is not allowed." };
  return { value };
}

// Multi-line fields allow newlines.
function cleanMulti(raw) {
  const value = normalizeText(raw);
  if (CONTROL_RE.test(value)) return { error: "Control characters are not allowed." };
  if (TAG_LIKE_RE.test(value)) return { error: "Tag-like text (< ...) is not allowed." };
  return { value };
}

/* ---------- Field validators (return an error string, or null) ---------- */

function validateNameKhmer(raw) {
  const { value, error } = cleanSingle(raw);
  if (error) return error;
  if (!value) return "Khmer name is required.";
  if (codepoints(value) > 120) return "Khmer name must be 120 characters or fewer.";
  if (!/^[\u1780-\u17FF\u200B-\u200D \-()]+$/.test(value))
    return "Khmer name may only contain Khmer script, spaces, hyphens, and parentheses.";
  if (!/[\u1780-\u17B3]/.test(value))
    return "Khmer name must contain at least one Khmer letter.";
  return null;
}

function validateTitle(raw) {
  const { value, error } = cleanSingle(raw);
  if (error) return error;
  if (!value) return "Common name is required.";
  if (codepoints(value) > 120) return "Common name must be 120 characters or fewer.";
  if (!/^[A-Za-z0-9\s.,'’()&/\-]+$/.test(value))
    return "Common name may contain only letters, digits, spaces, and . , ' ’ ( ) & / -.";
  if (!/[A-Za-z0-9]/.test(value))
    return "Common name must contain at least one letter or digit.";
  return null;
}

function validateScientificName(raw) {
  const { value, error } = cleanSingle(raw);
  if (error) return error;
  if (!value) return "Scientific name is required.";
  if (codepoints(value) > 120) return "Scientific name must be 120 characters or fewer.";
  if (/\d/.test(value)) return "Scientific name must not contain digits.";
  if (!/^[A-Za-zÀ-ÿ\u00D7\s.,&()'\-]+$/.test(value))
    return "Scientific name contains invalid characters.";
  const words = value.split(/\s+/);
  if (words.length < 2) return "Scientific name must include a genus and a species epithet.";
  if (!/^[A-ZÀ-Ý]/.test(words[0])) return "The genus must start with a capital letter.";
  if (!/^[a-zà-ÿ]/.test(words[1])) return "The species epithet must be lowercase.";
  return null;
}

function validateFamily(raw) {
  const { value, error } = cleanSingle(raw);
  if (error) return error;
  if (!value) return "Family is required.";
  if (codepoints(value) > 120) return "Family must be 120 characters or fewer.";
  if (!/^[A-Z][a-z]+$/.test(value)) return "Family must be a single capitalized word.";
  if (!/aceae$/.test(value) && !TRADITIONAL_FAMILIES.includes(value))
    return "Family must end in -aceae or be an accepted traditional name.";
  return null;
}

function validateLong(raw, label) {
  const { value, error } = cleanMulti(raw);
  if (error) return error;
  if (codepoints(value) < 20) return `${label} must be at least 20 characters.`;
  if (codepoints(value) > 5000) return `${label} must be 5,000 characters or fewer.`;
  if (countLetters(value) < 10) return `${label} must contain at least 10 letters.`;
  if (distinctLetters(value) < 4) return `${label} must contain at least 4 distinct letters.`;
  return null;
}

function validateHabitat(raw) {
  const { value, error } = cleanSingle(raw);
  if (error) return error;
  if (!value) return "Habitat is required.";
  if (codepoints(value) < 5) return "Habitat must be at least 5 characters.";
  if (codepoints(value) > 500) return "Habitat must be 500 characters or fewer.";
  if (countLetters(value) < 3) return "Habitat must contain at least 3 letters.";
  if (distinctLetters(value) < 2) return "Habitat must contain at least 2 distinct letters.";
  return null;
}

function validateCompounds(raw, unstudied) {
  if (unstudied) {
    if (normalizeText(raw)) return 'Cannot provide compounds and tick "unstudied" together.';
    return null;
  }
  const { value, error } = cleanMulti(raw);
  if (error) return error;
  if (!value) return 'Provide compounds, or tick "not yet studied".';
  const tags = value.split(/[;\n]/).map((t) => t.trim()).filter(Boolean);
  if (tags.length > 50) return "At most 50 compounds may be listed.";
  const seen = new Set();
  for (const tag of tags) {
    if (codepoints(tag) < 2 || codepoints(tag) > 60)
      return `Each compound must be 2–60 characters: "${tag}".`;
    if (tag.split(/\s+/).length > 6) return `Each compound may have at most 6 words: "${tag}".`;
    if (countLetters(tag) === 0) return `Each compound must contain a letter: "${tag}".`;
    if (/[.!?]$/.test(tag)) return `A compound must not end in . ! or ?: "${tag}".`;
    const key = tag.toLowerCase();
    if (seen.has(key)) return `Duplicate compound: "${tag}".`;
    seen.add(key);
  }
  return null;
}

function validateDosage(raw) {
  const { value, error } = cleanMulti(raw);
  if (error) return error;
  if (codepoints(value) > 1000) return "Dosage must be 1,000 characters or fewer.";
  return null;
}

function validateCaution(raw, noneKnown) {
  if (noneKnown) {
    if (normalizeText(raw)) return 'Cannot provide a caution and tick "none known" together.';
    return null;
  }
  const { value, error } = cleanMulti(raw);
  if (error) return error;
  if (codepoints(value) < 1) return 'Provide a caution, or tick "none known".';
  if (codepoints(value) > 1000) return "Caution must be 1,000 characters or fewer.";
  return null;
}

function validatePhoto(file) {
  if (!file) return "A photo is required.";
  const name = file.name || "";
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "svg") return "SVG images are not allowed.";
  if (!ALLOWED_EXTENSIONS.includes(ext))
    return "Photo must be a .jpg, .jpeg, .png, .webp, or .gif image.";
  if (file.size > MAX_PHOTO_BYTES) return "Photo must be 5 MiB or smaller.";
  if (!ALLOWED_MIME.includes(file.type)) return "That file type is not a supported image.";
  return null;
}

/* ---------- Styles ---------- */

const input = {
  width: "100%", boxSizing: "border-box", backgroundColor: "#07100C",
  border: "1px solid #2D4A3E", borderRadius: 4, color: "#DBE5DE",
  fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "10px 12px",
};

const styles = {
  page: { minHeight: "100vh", maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" },
  gateCard: { backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px", textAlign: "center" },
  card: { backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4, padding: "32px 24px" },
  title: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: 28, color: "#DBE5DE", margin: "0 0 4px" },
  subtitle: { fontSize: 14, color: "#86B29B", margin: "0 0 24px" },
  label: { display: "block", fontSize: 12, color: "#86B29B", letterSpacing: 0.5, margin: "16px 0 6px" },
  input,
  textarea: { ...input, minHeight: 100, resize: "vertical" },
  error: { color: "#FFB4AB", fontSize: 12, margin: "6px 0 0" },
  banner: {
    backgroundColor: "rgba(255, 180, 171, 0.1)", border: "1px solid rgba(255, 180, 171, 0.3)",
    color: "#FFB4AB", borderRadius: 4, fontSize: 14, padding: "10px 12px", marginBottom: 16,
  },
  button: {
    width: "100%", backgroundColor: "#B2D095", color: "#0C1511", fontWeight: 600,
    border: "none", borderRadius: 4, cursor: "pointer",
    fontFamily: "'Kantumruy Pro', sans-serif", fontSize: 15, padding: "12px 0", marginTop: 24,
  },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "#C1C8C2" },
  link: { color: "#B2D095" },
};

const VALIDATORS = {
  nameKhmer: (f) => validateNameKhmer(f.nameKhmer),
  title: (f) => validateTitle(f.title),
  scientificName: (f) => validateScientificName(f.scientificName),
  family: (f) => validateFamily(f.family),
  description: (f) => validateLong(f.description, "Description"),
  habitat: (f) => validateHabitat(f.habitat),
  medicinalUses: (f) => validateLong(f.medicinalUses, "Medicinal uses"),
  chemicalCompounds: (f) => validateCompounds(f.chemicalCompounds, f.compoundsUnstudied),
  dosage: (f) => validateDosage(f.dosage),
  caution: (f) => validateCaution(f.caution, f.cautionNoneKnown),
};

function ContributeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = Boolean(editId);
  // undefined = loading, null = signed out, object = signed in.
  const [user, setUser] = useState(undefined);
  const [form, setForm] = useState({
    nameKhmer: "", title: "", scientificName: "", family: "", description: "",
    habitat: "", medicinalUses: "", chemicalCompounds: "", dosage: "", caution: "",
    compoundsUnstudied: false, cautionNoneKnown: false,
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(null); // null | "photo" | "save"
  const [loadingEntry, setLoadingEntry] = useState(isEdit);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  // Pre-fill the form when editing an existing entry.
  useEffect(() => {
    if (!editId) return;
    supabase.from("entries").select("*").eq("id", editId).single().then(({ data, error }) => {
      if (error || !data) {
        setLoadingEntry(false);
        setBanner("Could not load this entry for editing.");
        return;
      }
      setForm({
        nameKhmer: data.name_khmer ?? "",
        title: data.title ?? "",
        scientificName: data.scientific_name ?? "",
        family: data.family ?? "",
        description: data.description ?? "",
        habitat: data.habitat ?? "",
        medicinalUses: data.medicinal_uses ?? "",
        chemicalCompounds: data.chemical_compounds ?? "",
        dosage: data.dosage ?? "",
        caution: data.caution ?? "",
        compoundsUnstudied: data.chemical_compounds == null,
        cautionNoneKnown: data.caution == null,
      });
      setLoadingEntry(false);
    });
  }, [editId]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  function validateField(name) {
    setErrors((e) => ({ ...e, [name]: VALIDATORS[name](form) }));
  }

  function validateAll() {
    const errs = {};
    for (const key of Object.keys(VALIDATORS)) {
      const msg = VALIDATORS[key](form);
      if (msg) errs[key] = msg;
    }
    if (photo || !isEdit) {
      const photoMsg = validatePhoto(photo);
      if (photoMsg) errs.photo = photoMsg;
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner("");
    const errs = validateAll();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setBanner("Please fix the highlighted fields before submitting.");
      return;
    }

    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) {
      setBanner("Your session has expired. Please sign in again.");
      return;
    }

    const payload = {
      title: normalizeText(form.title),
      name_khmer: normalizeText(form.nameKhmer),
      scientific_name: normalizeText(form.scientificName),
      family: normalizeText(form.family),
      description: normalizeText(form.description),
      habitat: normalizeText(form.habitat),
      medicinal_uses: normalizeText(form.medicinalUses),
      chemical_compounds: form.compoundsUnstudied
        ? null
        : normalizeText(form.chemicalCompounds)
            .split(/[;\n]/).map((t) => t.trim()).filter(Boolean).join("; ") || null,
      dosage: normalizeText(form.dosage) || null,
      caution: form.cautionNoneKnown ? null : normalizeText(form.caution),
    };

    setBusy("photo");
    try {
      if (photo) {
        const ext = photo.name.split(".").pop().toLowerCase();
        const path = `${u.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("photos").upload(path, photo);
        if (uploadErr) throw uploadErr;
        payload.photo_url = supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
      }

      setBusy("save");

      if (isEdit) {
        const { data, error: updateErr } = await supabase.from("entries")
          .update(payload).eq("id", editId).select();
        if (!updateErr && data && data.length > 0) {
          router.push("/");
          router.refresh();
          return;
        }
        console.error("Update failed or refused by policy:", updateErr);
        setBanner("That change wasn't saved");
        setBusy(null);
        return;
      }

      const { error: insertErr } = await supabase.from("entries").insert({ ...payload, owner: u.id });
      if (insertErr) throw insertErr;

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err); // log real error, never surface it to the user
      setBanner("Something went wrong. Please try again.");
      setBusy(null);
    }
  }

  if (user === undefined) return <main style={styles.page} />;

  if (user === null) {
    return (
      <main style={styles.page}>
        <div style={styles.gateCard}>
          <h1 style={styles.title}>Contribute to the Archive</h1>
          <p style={{ color: "#86B29B", margin: "12px 0 24px" }}>
            You must be signed in to contribute to the archive.
          </p>
          <p style={{ fontSize: 14 }}>
            <Link href="/login" style={styles.link}>Sign in</Link>
            {" · "}
            <Link href="/signup" style={styles.link}>Sign up</Link>
          </p>
        </div>
      </main>
    );
  }

  if (loadingEntry) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: "#86B29B", margin: 0 }}>Loading entry…</p>
        </div>
      </main>
    );
  }

  const fld = (id, label, err, el) => (
    <>
      <label style={styles.label} htmlFor={id}>{label}</label>
      {el(id)}
      {err && <p style={styles.error}>{err}</p>}
    </>
  );

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isEdit ? "Edit Plant Entry" : "Contribute a Plant"}</h1>
        <p style={styles.subtitle}>{isEdit ? "កែប្រែព័ត៌មានរុក្ខជាតិ" : "បញ្ចូលរុក្ខជាតិឱសថថ្មី"}</p>
        {banner && <p style={styles.banner}>{banner}</p>}

        <form onSubmit={handleSubmit} noValidate>
          {fld("nameKhmer", "Khmer name *", errors.nameKhmer, (id) => (
            <input id={id} style={styles.input} value={form.nameKhmer}
              onChange={(e) => setField("nameKhmer", e.target.value)}
              onBlur={() => validateField("nameKhmer")} />
          ))}

          {fld("title", "Common name (English) *", errors.title, (id) => (
            <input id={id} style={styles.input} value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              onBlur={() => validateField("title")} />
          ))}

          {fld("scientificName", "Scientific name *", errors.scientificName, (id) => (
            <input id={id} style={styles.input} value={form.scientificName}
              onChange={(e) => setField("scientificName", e.target.value)}
              onBlur={() => validateField("scientificName")} />
          ))}

          {fld("family", "Family *", errors.family, (id) => (
            <input id={id} style={styles.input} value={form.family}
              onChange={(e) => setField("family", e.target.value)}
              onBlur={() => validateField("family")} />
          ))}

          {fld("description", "Description (morphology) *", errors.description, (id) => (
            <textarea id={id} style={styles.textarea} value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              onBlur={() => validateField("description")} />
          ))}

          {fld("habitat", "Habitat & distribution *", errors.habitat, (id) => (
            <input id={id} style={styles.input} value={form.habitat}
              onChange={(e) => setField("habitat", e.target.value)}
              onBlur={() => validateField("habitat")} />
          ))}

          {fld("medicinalUses", "Medicinal uses *", errors.medicinalUses, (id) => (
            <textarea id={id} style={styles.textarea} value={form.medicinalUses}
              onChange={(e) => setField("medicinalUses", e.target.value)}
              onBlur={() => validateField("medicinalUses")} />
          ))}

          {fld("chemicalCompounds", "Chemical compounds *", errors.chemicalCompounds, (id) => (
            <textarea id={id} style={styles.textarea}
              value={form.chemicalCompounds} disabled={form.compoundsUnstudied}
              onChange={(e) => setField("chemicalCompounds", e.target.value)}
              onBlur={() => validateField("chemicalCompounds")} />
          ))}
          <label style={styles.checkboxRow}>
            <input type="checkbox" checked={form.compoundsUnstudied}
              onChange={(e) => setForm((f) => ({ ...f, compoundsUnstudied: e.target.checked, chemicalCompounds: e.target.checked ? "" : f.chemicalCompounds }))} />
            Phytochemicals not yet formally studied / មិនទាន់មានការស្រាវជ្រាវគីមី
          </label>

          {fld("dosage", "Dosage (optional)", errors.dosage, (id) => (
            <textarea id={id} style={styles.textarea} value={form.dosage}
              onChange={(e) => setField("dosage", e.target.value)}
              onBlur={() => validateField("dosage")} />
          ))}

          {fld("caution", "Caution / contraindications *", errors.caution, (id) => (
            <textarea id={id} style={styles.textarea}
              value={form.caution} disabled={form.cautionNoneKnown}
              onChange={(e) => setField("caution", e.target.value)}
              onBlur={() => validateField("caution")} />
          ))}
          <label style={styles.checkboxRow}>
            <input type="checkbox" checked={form.cautionNoneKnown}
              onChange={(e) => setForm((f) => ({ ...f, cautionNoneKnown: e.target.checked, caution: e.target.checked ? "" : f.caution }))} />
            No specific contraindications recorded / មិនមានការកត់ត្រាការហាមឃាត់ជាក់លាក់
          </label>

          <label style={styles.label} htmlFor="photo">Photo {isEdit ? "(optional)" : "*"}  (.jpg, .png, .webp, .gif — 5 MiB max)</label>
          <input id="photo" type="file" accept=".jpg,.jpeg,.png,.webp,.gif"
            onChange={(e) => { setPhoto(e.target.files[0] || null); setErrors((er) => ({ ...er, photo: null })); }} />
          {errors.photo && <p style={styles.error}>{errors.photo}</p>}

          <button type="submit" disabled={busy !== null}
            style={{ ...styles.button, opacity: busy ? 0.6 : 1, cursor: busy ? "not-allowed" : "pointer" }}>
            {busy === "photo" ? "Uploading photo…" : busy === "save" ? "Saving entry…" : "Submit entry"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ContributePage() {
  return (
    <Suspense fallback={<main style={styles.page} />}>
      <ContributeForm />
    </Suspense>
  );
}