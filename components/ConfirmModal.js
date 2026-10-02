"use client";

const styles = {
  overlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, zIndex: 1000,
  },
  card: {
    backgroundColor: "#18221D", border: "1px solid #2D4A3E", borderRadius: 6,
    padding: "24px", maxWidth: 360, width: "100%",
  },
  title: { margin: "0 0 8px", fontSize: 18, color: "#DBE5DE" },
  message: { margin: 0, fontSize: 14, color: "#C1C8C2", lineHeight: 1.6 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 },
  cancel: {
    fontSize: 13, color: "#86B29B", backgroundColor: "transparent", border: "1px solid #2D4A3E",
    borderRadius: 4, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit",
  },
  confirm: {
    fontSize: 13, color: "#0C1511", backgroundColor: "#FFB4AB", fontWeight: 600,
    border: "none", borderRadius: 4, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit",
  },
};

export default function ConfirmModal({ open, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Please confirm</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancel}>Cancel</button>
          <button type="button" onClick={onConfirm} style={styles.confirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}