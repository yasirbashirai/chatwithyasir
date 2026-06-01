import type { Member, Message } from "../types";

// Pause/resume: the whole chat is mirrored to localStorage so a visitor can
// leave and pick up exactly where they left off. No backend involved.

const KEY = "cwy_session_v1";

export interface Session {
  phase: "onboarding" | "chat";
  me: Member | null;
  members: Member[];
  messages: Message[];
  chips: string[];
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.messages) || !Array.isArray(s.members)) return null;
    return s as Session;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage full / disabled — pause/resume just won't persist */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// The visitor's profile (name / email / avatar) is remembered separately from
// the conversation, so they can sign out and sign back in as themselves.
const PROFILE_KEY = "cwy_profile";

export interface Profile {
  name: string;
  email: string;
  emoji: string;
  color: string;
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.name && p.email ? (p as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}
