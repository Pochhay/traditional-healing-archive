"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../utils/supabase/client";

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

export default function EntryActions({ entry }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    const { data, error } = await supabase.from("entries").delete().eq("id", entry.id).select();
    if (!error && data && data.length > 0) {
      router.refresh();
    } else {
      console.error("Delete failed or refused by policy:", error);
      window.alert("That change wasn't saved");
    }
  }

  return (
    <div style={styles.wrap}>
      <Link href={`/contribute?id=${entry.id}`} style={styles.editLink}>Edit</Link>
      <button type="button" onClick={handleDelete} style={styles.delBtn}>Delete</button>
    </div>
  );
}