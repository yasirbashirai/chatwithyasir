import { useEffect, useState } from "react";
import { Panel } from "./Panel";
import { adminLogin, getLeads, apiConfigured, type Lead } from "../lib/api";

/**
 * AdminConsole — Yasir's login + captured-leads inbox. Talks to the backend
 * in server/. The JWT is kept in localStorage so he stays signed in.
 */
const TOKEN_KEY = "cwy_admin_token";
const field =
  "w-full glass rounded-2xl px-4 py-2.5 text-[15px] text-ink outline-none focus:ring-2 focus:ring-teal/40 transition";

export function AdminConsole({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);

  const loadLeads = async (t: string) => {
    setBusy(true);
    setError("");
    try {
      setLeads(await getLeads(t));
    } catch {
      // token likely expired
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setError("Session expired, please sign in again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (token) loadLeads(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    setBusy(true);
    setError("");
    try {
      const { token: t } = await adminLogin(email, password);
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      await loadLeads(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setLeads(null);
  };

  // Backend not wired up yet
  if (!apiConfigured) {
    return (
      <Panel emoji="🗂" title="Admin console" onClose={onClose} maxWidth="max-w-md">
        <p className="text-[15px] text-ink/75 leading-relaxed">
          The admin backend isn't connected yet. Run the server in <code className="bg-ink/5 px-1 rounded">server/</code> and
          set <code className="bg-ink/5 px-1 rounded">VITE_API_URL</code> in the project's <code className="bg-ink/5 px-1 rounded">.env</code> to
          enable login + the captured-leads inbox.
        </p>
      </Panel>
    );
  }

  // Logged out → login form
  if (!token) {
    return (
      <Panel
        emoji="🔐"
        title="Admin sign in"
        subtitle="Yasir only."
        onClose={onClose}
        maxWidth="max-w-sm"
        footer={
          <button
            onClick={signIn}
            disabled={busy || !email || !password}
            className="w-full glass-teal gold-ring rounded-2xl py-3 text-white font-display font-bold transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input
            className={field}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
          />
          {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}
        </div>
      </Panel>
    );
  }

  // Logged in → leads inbox
  return (
    <Panel
      emoji="🗂"
      title="Captured leads"
      subtitle={leads ? `${leads.length} total` : "Loading…"}
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between text-sm">
          <button onClick={() => loadLeads(token)} className="font-semibold text-teal-dark hover:text-teal transition">
            ↻ Refresh
          </button>
          <button onClick={signOut} className="font-semibold text-ink/55 hover:text-ink transition">
            Sign out
          </button>
        </div>
      }
    >
      {error && <p className="text-[13px] text-red-500 font-medium mb-3">{error}</p>}
      {!leads || leads.length === 0 ? (
        <div className="text-center text-sm text-ink/50 py-10">
          {busy ? "Loading…" : "No leads captured yet."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((l) => (
            <div key={l.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-ink text-sm truncate">{l.name || "(no name)"}</div>
                <a href={`mailto:${l.email}`} className="text-[13px] text-teal-dark hover:underline truncate block">
                  {l.email}
                </a>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide">{l.source}</div>
                <div className="text-[11px] text-ink/40">{new Date(l.at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
