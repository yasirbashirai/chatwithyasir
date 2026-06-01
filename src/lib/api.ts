// Thin client for the admin backend. Everything is gated on VITE_API_URL:
// if it isn't set, lead capture + admin console stay dormant and the static
// site keeps working exactly as before.

const API_URL = ((import.meta as { env?: Record<string, string> }).env?.VITE_API_URL || "").replace(/\/$/, "");

export const apiConfigured = !!API_URL;

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  note: string;
  at: string;
}

/** Fire-and-forget: capture a client lead when they join / inquire. */
export async function postLead(lead: { name: string; email: string; source?: string; note?: string }) {
  if (!API_URL) return;
  try {
    await fetch(`${API_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  } catch {
    /* offline / no backend — non-blocking */
  }
}

export async function adminLogin(email: string, password: string): Promise<{ token: string; email: string }> {
  const r = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function getLeads(token: string): Promise<Lead[]> {
  const r = await fetch(`${API_URL}/api/leads`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error("Could not load leads");
  return (await r.json()).leads;
}
