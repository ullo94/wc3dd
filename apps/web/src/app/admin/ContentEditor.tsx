"use client";

import { useState } from "react";

export function ContentEditor({
  slug,
  title,
  initial,
}: {
  slug: "rules" | "conduct" | "maps";
  title: string;
  initial: string;
}) {
  const [body, setBody] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, bodyMd: body }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setMsg(data.error ?? "Save failed");
        return;
      }
      setMsg("Saved to DATA_DIR/content and DB.");
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <h3>{title}</h3>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="actions" style={{ marginTop: "0.75rem" }}>
        <button className="btn" type="button" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save"}
        </button>
        {msg ? <span className="success">{msg}</span> : null}
      </div>
    </div>
  );
}
