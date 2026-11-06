"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApprovalButtons({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="actions">
      <button className="btn" type="button" disabled={busy} onClick={() => act("approve")}>
        Approve
      </button>
      <button className="btn danger" type="button" disabled={busy} onClick={() => act("reject")}>
        Reject
      </button>
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
