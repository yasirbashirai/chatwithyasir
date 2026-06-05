// Thin client for the live AI chat (/api/chat — a Vercel serverless function).
//
// The endpoint defaults to a same-origin relative path so it "just works" on
// Vercel with no config. Returns the AI reply, or null on any failure so the
// caller can gracefully fall back to the scripted keyword brain.

export type AiTurn = { role: "user" | "model"; text: string };

const AI_URL =
  ((import.meta as { env?: Record<string, string> }).env?.VITE_AI_URL || "/api/chat").replace(/\/$/, "");

export async function askYasirAI(history: AiTurn[]): Promise<string | null> {
  try {
    const r = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    if (!r.ok) return null;
    const data = (await r.json().catch(() => null)) as { reply?: string } | null;
    const reply = data?.reply?.trim();
    return reply ? reply : null;
  } catch {
    // Network error / endpoint not available (e.g. local `vite dev` without
    // `vercel dev`) — caller falls back to the scripted answers.
    return null;
  }
}
