// chatwithyasir — admin backend.
// A small, dependency-light API: admin login (JWT) + a captured-leads store.
// The chat frontend posts leads here when VITE_API_URL is set; Yasir logs in
// to review them. Data is kept in data/leads.json (no external DB needed).

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const LEADS_FILE = join(DATA_DIR, "leads.json");

// ---- Config (override via .env) ----
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
// Admin access is restricted to this single email. Override via .env if needed.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "yasirbashirai@gmail.com").toLowerCase();
// Either ADMIN_PASSWORD_HASH (bcrypt, recommended) or ADMIN_PASSWORD (plain, dev only).
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";

// ---- Tiny JSON store ----
function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(LEADS_FILE)) writeFileSync(LEADS_FILE, "[]");
}
function readLeads() {
  ensureStore();
  try {
    return JSON.parse(readFileSync(LEADS_FILE, "utf8"));
  } catch {
    return [];
  }
}
function writeLeads(leads) {
  ensureStore();
  writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// ---- App ----
const app = express();
app.use(cors()); // allow the chat frontend (any origin) to post leads
app.use(express.json());

function checkPassword(plain) {
  if (ADMIN_PASSWORD_HASH) return bcrypt.compareSync(plain, ADMIN_PASSWORD_HASH);
  return plain === ADMIN_PASSWORD;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Admin login → JWT
app.post("/api/admin/login", (req, res) => {
  const { email = "", password = "" } = req.body || {};
  if (email.toLowerCase() !== ADMIN_EMAIL || !checkPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ email: ADMIN_EMAIL, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email: ADMIN_EMAIL });
});

// Capture a lead (public — called by the chat when a client joins / inquires)
app.post("/api/leads", (req, res) => {
  const { name = "", email = "", source = "chat", note = "" } = req.body || {};
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }
  const leads = readLeads();
  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 200),
    source: String(source).slice(0, 40),
    note: String(note).slice(0, 1000),
    at: new Date().toISOString(),
  };
  leads.push(lead);
  writeLeads(leads);
  res.status(201).json({ ok: true, id: lead.id });
});

// List captured leads (admin only), newest first
app.get("/api/leads", requireAuth, (_req, res) => {
  res.json({ leads: readLeads().slice().reverse() });
});

app.listen(PORT, () => {
  console.log(`chatwithyasir admin API on http://localhost:${PORT}`);
  console.log(`Admin: ${ADMIN_EMAIL} (set ADMIN_PASSWORD / ADMIN_PASSWORD_HASH + JWT_SECRET in .env)`);
});
