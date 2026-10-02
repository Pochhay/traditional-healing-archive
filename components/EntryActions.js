"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../utils/supabase/client";
import ConfirmModal from "./ConfirmModal.js";

const supabase = createClient();

const styles = {
  wrap: { display: "flex", alignItems: "center", gap: 8 },
  editLink: {
    fontSize: 12, color: "#B2D095", textDecoration: "none", padding: "4px 10px",
    backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 4,
  },
  delBtn: {
    fontSize: 12, color: "#FFB4AB", backgroundColor: "#18221D", border: "1px solid #2D4A3E",
    borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit",
  },
};

export default function EntryActions({ entry, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { data, error } = await supabase.from("entries").delete().eq("id", entry.id).select();
    setDeleting(false);
    setConfirmOpen(false);
    if (!error && data && data.length > 0) {
      onDelete(entry.id);
    } else {
      console.error("Delete failed or refused by policy:", error);
      window.alert("That change wasn't saved");
    }
  }

  return (
    <div style={styles.wrap}>
      <Link href={`/contribute?id=${entry.id}`} style={styles.editLink}>Edit</Link>
      <button type="button" onClick={() => setConfirmOpen(true)} style={styles.delBtn}>Delete</button>
      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to delete this entry? This cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}