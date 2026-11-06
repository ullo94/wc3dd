"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TestingPanel({ seasonId }: { seasonId: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [count, setCount] = useState(4);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("approved");
  const [playerId, setPlayerId] = useState("");

  async function call(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/testing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMsg(data.error ?? "Failed");
        return;
      }
      setMsg(data.message ?? "OK");
      router.refresh();
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-grid">
      <div className="actions">
        <label style={{ minWidth: 120 }}>
          Fake players
          <input
            type="number"
            min={1}
            max={32}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>
        <button
          className="btn"
          type="button"
          disabled={busy}
          onClick={() => call("seed_players", { count })}
        >
          Seed fake players
        </button>
      </div>

      <div className="actions">
        <label style={{ minWidth: 180 }}>
          Player id
          <input value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="cuid" />
        </label>
        <label style={{ minWidth: 140 }}>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <button
          className="btn secondary"
          type="button"
          disabled={busy || !playerId}
          onClick={() => call("set_status", { userId: playerId, status })}
        >
          Set status
        </button>
      </div>

      <div className="actions">
        <button
          className="btn"
          type="button"
          disabled={busy || !seasonId}
          onClick={() => call("create_bo3", { seasonId })}
        >
          Create fake BO3 match
        </button>
        <button
          className="btn secondary"
          type="button"
          disabled={busy || !seasonId}
          onClick={() => call("advance_week", { seasonId })}
        >
          Advance week
        </button>
        <button
          className="btn danger"
          type="button"
          disabled={busy}
          onClick={() => {
            if (confirm("Wipe all isSim players and matches?")) call("wipe_sim");
          }}
        >
          Wipe sim data
        </button>
      </div>

      {msg ? <p className={msg.includes("Failed") || msg.includes("error") ? "error" : "success"}>{msg}</p> : null}
    </div>
  );
}
