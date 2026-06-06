// Durable store for chatwithyasir — Neon (or any) Postgres via `pg`.
//
// A conversation row IS a captured lead (visitor name + email live on it), and
// every message (visitor / Yasir / AI / system) is stored so transcripts are
// permanent. Replaces the old leads.json file store.
//
// Required env: DATABASE_URL (Neon connection string, e.g.
//   postgresql://user:pass@host/db?sslmode=require)

import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "";

// Neon (and most hosted Postgres) require SSL. `rejectUnauthorized:false` keeps
// it simple — Neon presents a valid cert but the CA isn't always in the image.
export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
});

export const dbConfigured = !!connectionString;

// ---- Schema (idempotent — runs on boot) ----
const SCHEMA = `
create extension if not exists pgcrypto;

create table if not exists conversations (
  id              uuid primary key default gen_random_uuid(),
  visitor_name    text not null,
  visitor_email   text not null,
  visitor_token   uuid not null default gen_random_uuid(),
  source          text default 'chat',
  status          text default 'open',
  human_active    boolean default false,
  created_at      timestamptz default now(),
  last_message_at timestamptz default now()
);

create table if not exists messages (
  id              bigserial primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender          text not null,
  kind            text default 'text',
  text            text not null,
  created_at      timestamptz default now()
);

-- Media columns (added incrementally so existing tables upgrade in place).
-- For now media is stored inline as a base64 data URL in the media column
-- (Option B, no external storage). Swap to a storage URL later, no schema change.
alter table messages add column if not exists media text;
alter table messages add column if not exists file_name text;
alter table messages add column if not exists audio_duration integer;
alter table messages add column if not exists file_size text;

create index if not exists messages_conv_idx on messages (conversation_id, created_at);
create index if not exists conversations_recent_idx on conversations (last_message_at desc);
`;

export async function initDb() {
  if (!dbConfigured) {
    console.warn("⚠ DATABASE_URL not set — durable storage disabled.");
    return;
  }
  await pool.query(SCHEMA);
  console.log("✓ Database ready.");
}

// ---- Conversations ----

/** Create a conversation (= a lead). Returns { id, visitor_token }. */
export async function createConversation({ name, email, source = "chat" }) {
  const { rows } = await pool.query(
    `insert into conversations (visitor_name, visitor_email, source)
     values ($1, $2, $3)
     returning id, visitor_token`,
    [String(name).slice(0, 120), String(email).slice(0, 200), String(source).slice(0, 40)],
  );
  return rows[0];
}

/** Validate that a token matches a conversation (visitor capability check). */
export async function validateVisitor(conversationId, token) {
  if (!conversationId || !token) return false;
  const { rows } = await pool.query(
    `select 1 from conversations where id = $1 and visitor_token = $2 limit 1`,
    [conversationId, token],
  );
  return rows.length > 0;
}

/** Flip the human_active flag (true when Yasir joins → AI yields). */
export async function setHumanActive(conversationId, active) {
  await pool.query(`update conversations set human_active = $2 where id = $1`, [
    conversationId,
    !!active,
  ]);
}

/** Admin list — newest first, with a short preview of the latest message. */
export async function getConversations(limit = 100) {
  const { rows } = await pool.query(
    `select c.id, c.visitor_name, c.visitor_email, c.source, c.status,
            c.human_active, c.created_at, c.last_message_at,
            (select m.text from messages m
               where m.conversation_id = c.id
               order by m.created_at desc limit 1) as last_text,
            (select count(*) from messages m where m.conversation_id = c.id) as message_count
       from conversations c
      order by c.last_message_at desc
      limit $1`,
    [limit],
  );
  return rows;
}

/** Full transcript for one conversation (header + ordered messages). */
export async function getTranscript(conversationId) {
  const head = await pool.query(
    `select id, visitor_name, visitor_email, source, status, human_active,
            created_at, last_message_at
       from conversations where id = $1`,
    [conversationId],
  );
  if (!head.rows.length) return null;
  const msgs = await pool.query(
    `select id, sender, kind, text, media, file_name, audio_duration, file_size, created_at
       from messages where conversation_id = $1
      order by created_at asc, id asc`,
    [conversationId],
  );
  return { conversation: head.rows[0], messages: msgs.rows };
}

// ---- Messages ----

/**
 * Append a message and bump the conversation's last_message_at. `media` (a
 * base64 data URL) + fileName/audioDuration/fileSize are optional — set for
 * voice notes, photos, and files.
 */
export async function addMessage({
  conversationId,
  sender,
  text,
  kind = "text",
  media = null,
  fileName = null,
  audioDuration = null,
  fileSize = null,
}) {
  const { rows } = await pool.query(
    `insert into messages (conversation_id, sender, text, kind, media, file_name, audio_duration, file_size)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, sender, kind, text, media, file_name, audio_duration, file_size, created_at`,
    [conversationId, sender, String(text).slice(0, 4000), kind, media, fileName, audioDuration, fileSize],
  );
  await pool.query(`update conversations set last_message_at = now() where id = $1`, [
    conversationId,
  ]);
  return rows[0];
}
