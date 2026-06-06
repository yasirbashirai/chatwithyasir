// chatwithyasir — live chat backend.
//
// Three jobs:
//   1. Durably capture every visitor (name, email, full transcript) in Postgres.
//   2. Email Yasir the moment a visitor opens a chat.
//   3. Real-time two-way "live join": Yasir sees conversations and chats live;
//      when he joins, the front-end AI yields (human_active flag).
//
// REST (Express) for create/login/list/transcript; Socket.IO for live delivery.
// Config via .env — see .env.example.

// Load .env FIRST — db.js / mail.js read process.env at import time, and ES
// module imports below are evaluated before this file's body runs.
import "dotenv/config";

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer } from "node:http";
import { Server as SocketServer } from "socket.io";

import {
  initDb,
  dbConfigured,
  createConversation,
  validateVisitor,
  setHumanActive,
  getConversations,
  getTranscript,
  addMessage,
} from "./db.js";
import { notifyNewConversation } from "./mail.js";

// ---- Config ----
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "yasirbashirai@gmail.com").toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";

// CORS allowlist — the deployed frontend + localhost dev. "*" allowed only if
// ALLOWED_ORIGINS is unset (keeps local dev frictionless).
const ALLOWED = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function originAllowed(origin) {
  if (!ALLOWED.length) return true; // dev: allow all
  if (!origin) return true; // same-origin / curl
  if (ALLOWED.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".vercel.app")) return true; // preview deploys
  } catch {
    /* malformed */
  }
  return false;
}

const corsMw = cors({
  origin: (origin, cb) => cb(null, originAllowed(origin)),
});

// ---- App + HTTP + Socket.IO on one port ----
const app = express();
app.use(corsMw);
app.use(express.json());

const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: (origin, cb) => cb(null, originAllowed(origin)) },
});

// ---- Auth helpers ----
function checkPassword(plain) {
  if (ADMIN_PASSWORD_HASH) return bcrypt.compareSync(plain, ADMIN_PASSWORD_HASH);
  return plain === ADMIN_PASSWORD;
}
function verifyAdmin(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload?.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const admin = verifyAdmin(token);
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  req.admin = admin;
  next();
}

// ---- Light per-IP rate limit (abuse guard on public writes) ----
const HITS = new Map();
function rateLimited(ip, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 5000) for (const [k, v] of HITS) if (!v.some((t) => now - t < windowMs)) HITS.delete(k);
  return arr.length > max;
}
const ipOf = (req) =>
  (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || req.socket.remoteAddress || "anon";

// ---- Room names ----
const convRoom = (id) => `conv:${id}`;
const ADMIN_ROOM = "admin";

// ============================ REST ============================

app.get("/api/health", (_req, res) => res.json({ ok: true, db: dbConfigured }));

// Admin login → JWT
app.post("/api/admin/login", (req, res) => {
  const { email = "", password = "" } = req.body || {};
  if (email.toLowerCase() !== ADMIN_EMAIL || !checkPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ email: ADMIN_EMAIL, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email: ADMIN_EMAIL });
});

// Visitor opens a chat → create conversation (= lead), email Yasir, notify admins.
app.post("/api/conversation", async (req, res) => {
  if (!dbConfigured) return res.status(503).json({ error: "Storage not configured" });
  if (rateLimited(ipOf(req), 10)) return res.status(429).json({ error: "Slow down" });
  const { name = "", email = "", source = "chat" } = req.body || {};
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: "Valid email required" });
  try {
    const { id, visitor_token } = await createConversation({ name, email, source });
    // Fire-and-forget email + live admin ping (don't block the visitor).
    notifyNewConversation({ name, email, conversationId: id });
    io.to(ADMIN_ROOM).emit("admin:new", {
      id,
      visitor_name: name,
      visitor_email: email,
      source,
      human_active: false,
      last_text: null,
      message_count: 0,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
    res.status(201).json({ conversationId: id, visitorToken: visitor_token });
  } catch (e) {
    console.error("createConversation failed:", e?.message || e);
    res.status(500).json({ error: "Could not start conversation" });
  }
});

// Visitor (or the visitor's own AI reply) posts a message. Validated by token.
// sender must be 'visitor' or 'ai' here — 'yasir'/'system' only via sockets.
app.post("/api/message", async (req, res) => {
  if (!dbConfigured) return res.status(503).json({ error: "Storage not configured" });
  if (rateLimited(ipOf(req), 60)) return res.status(429).json({ error: "Slow down" });
  const { conversationId, visitorToken, text, sender = "visitor" } = req.body || {};
  const who = sender === "ai" ? "ai" : "visitor";
  if (!text || !String(text).trim()) return res.status(400).json({ error: "Empty message" });
  try {
    const ok = await validateVisitor(conversationId, visitorToken);
    if (!ok) return res.status(403).json({ error: "Invalid conversation" });
    const msg = await addMessage({ conversationId, sender: who, text });
    // Deliver to anyone watching this conversation (Yasir if he's opened it).
    io.to(convRoom(conversationId)).emit("message", { conversationId, ...msg });
    io.to(ADMIN_ROOM).emit("admin:update", { conversationId, last_text: msg.text, at: msg.created_at });
    res.status(201).json({ ok: true, id: msg.id });
  } catch (e) {
    console.error("addMessage failed:", e?.message || e);
    res.status(500).json({ error: "Could not save message" });
  }
});

// Admin: list conversations (newest first).
app.get("/api/admin/conversations", requireAuth, async (_req, res) => {
  try {
    res.json({ conversations: await getConversations() });
  } catch (e) {
    console.error("getConversations failed:", e?.message || e);
    res.status(500).json({ error: "Could not load conversations" });
  }
});

// Admin: full transcript for one conversation.
app.get("/api/admin/conversations/:id", requireAuth, async (req, res) => {
  try {
    const data = await getTranscript(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (e) {
    console.error("getTranscript failed:", e?.message || e);
    res.status(500).json({ error: "Could not load transcript" });
  }
});

// ============================ Socket.IO ============================
//
// Visitor handshake:  io(url, { auth: { conversationId, visitorToken } })
// Admin handshake:    io(url, { auth: { token: <JWT> } })

io.on("connection", async (socket) => {
  const { token, conversationId, visitorToken } = socket.handshake.auth || {};

  // ---- Admin socket ----
  if (token) {
    const admin = verifyAdmin(token);
    if (!admin) return socket.disconnect(true);
    socket.data.role = "admin";
    socket.join(ADMIN_ROOM);

    // Open a conversation to receive its live messages.
    socket.on("admin:open", ({ conversationId: cid } = {}) => {
      if (cid) socket.join(convRoom(cid));
    });

    // Join = take over from the AI. Flip flag, broadcast a system line.
    socket.on("admin:join", async ({ conversationId: cid } = {}) => {
      if (!cid) return;
      try {
        await setHumanActive(cid, true);
        socket.join(convRoom(cid));
        const sys = await addMessage({
          conversationId: cid,
          sender: "system",
          text: "Yasir joined the chat 👋",
          kind: "system",
        });
        io.to(convRoom(cid)).emit("human_active", { conversationId: cid, active: true });
        io.to(convRoom(cid)).emit("message", { conversationId: cid, ...sys });
        io.to(ADMIN_ROOM).emit("admin:update", { conversationId: cid, last_text: sys.text, at: sys.created_at });
      } catch (e) {
        console.error("admin:join failed:", e?.message || e);
      }
    });

    // Yasir replies live.
    socket.on("message", async ({ conversationId: cid, text } = {}) => {
      if (!cid || !text || !String(text).trim()) return;
      try {
        const msg = await addMessage({ conversationId: cid, sender: "yasir", text });
        io.to(convRoom(cid)).emit("message", { conversationId: cid, ...msg });
        io.to(ADMIN_ROOM).emit("admin:update", { conversationId: cid, last_text: msg.text, at: msg.created_at });
      } catch (e) {
        console.error("admin message failed:", e?.message || e);
      }
    });

    // Yasir steps out → AI resumes for that visitor.
    socket.on("admin:leave", async ({ conversationId: cid } = {}) => {
      if (!cid) return;
      try {
        await setHumanActive(cid, false);
        io.to(convRoom(cid)).emit("human_active", { conversationId: cid, active: false });
      } catch (e) {
        console.error("admin:leave failed:", e?.message || e);
      }
    });

    // Typing indicator → visitor.
    socket.on("admin:typing", ({ conversationId: cid } = {}) => {
      if (cid) socket.to(convRoom(cid)).emit("typing", { conversationId: cid, from: "yasir" });
    });
    return;
  }

  // ---- Visitor socket ----
  if (conversationId && visitorToken) {
    const ok = await validateVisitor(conversationId, visitorToken).catch(() => false);
    if (!ok) return socket.disconnect(true);
    socket.data.role = "visitor";
    socket.data.conversationId = conversationId;
    socket.join(convRoom(conversationId));

    // Let the visitor's typing show on Yasir's side.
    socket.on("visitor:typing", () => {
      socket.to(convRoom(conversationId)).emit("typing", { conversationId, from: "visitor" });
    });
    return;
  }

  // Neither valid → drop.
  socket.disconnect(true);
});

// ---- Boot ----
initDb()
  .catch((e) => console.error("DB init failed:", e?.message || e))
  .finally(() => {
    httpServer.listen(PORT, () => {
      console.log(`chatwithyasir live server on http://localhost:${PORT}`);
      console.log(`Admin: ${ADMIN_EMAIL}`);
      console.log(`Storage: ${dbConfigured ? "Postgres ✓" : "NOT configured ✗ (set DATABASE_URL)"}`);
    });
  });
