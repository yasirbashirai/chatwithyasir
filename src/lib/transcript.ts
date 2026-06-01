import type { Bubble, Member, Message } from "../types";

// Build a clean, branded transcript of the conversation and open the browser's
// print dialog so the visitor can "Save as PDF". Zero dependencies.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bubbleToHtml(b: Bubble): string {
  switch (b.kind) {
    case "text":
      return `<p>${escapeHtml(b.text)}</p>`;
    case "stat":
      return `<p class="muted">${b.items.map((s) => `<b>${escapeHtml(s.value)}</b> ${escapeHtml(s.label)}`).join(" · ")}</p>`;
    case "services":
      return `<p class="muted">${b.items.map(escapeHtml).join(" · ")}</p>`;
    case "cta":
      return `<p class="muted">→ ${escapeHtml(b.label)} (${escapeHtml(b.href)})</p>`;
    case "links":
      return `<p class="muted">${b.items.map((l) => `${escapeHtml(l.label)} (${escapeHtml(l.href)})`).join(" · ")}</p>`;
    case "actions":
      return `<p class="muted">[ ${b.items.map((a) => escapeHtml(a.label)).join(" · ")} ]</p>`;
  }
}

function msgToHtml(m: Message, senderName: string, isMe: boolean): string {
  if (m.kind === "system") {
    return `<div class="sys">${escapeHtml(m.text ?? "")}</div>`;
  }
  let body = "";
  switch (m.kind) {
    case "text":
      body = `<p>${escapeHtml(m.text ?? "")}</p>`;
      break;
    case "gif":
      body = `<p class="muted">[GIF]</p>`;
      break;
    case "image":
      body = `<p class="muted">[Image: ${escapeHtml(m.fileName ?? "")}]</p>`;
      break;
    case "file":
      body = `<p class="muted">[File: ${escapeHtml(m.fileName ?? "")} · ${escapeHtml(m.fileSize ?? "")}]</p>`;
      break;
    case "rich":
      body = (m.bubbles ?? []).map(bubbleToHtml).join("");
      break;
  }
  return `
    <div class="row ${isMe ? "me" : "them"}">
      <div class="who">${escapeHtml(senderName)}</div>
      <div class="bubble">${body}</div>
    </div>`;
}

export function saveTranscriptAsPdf(opts: {
  me: Member | null;
  members: Member[];
  messages: Message[];
}) {
  const { me, members, messages } = opts;
  const nameOf = (id: string) =>
    id === "me" ? me?.name ?? "You" : members.find((x) => x.id === id)?.name ?? id;

  const rows = messages.map((m) => msgToHtml(m, nameOf(m.senderId), m.senderId === "me")).join("");

  const clientLine = me
    ? `${escapeHtml(me.name)}${me.email ? ` · ${escapeHtml(me.email)}` : ""}`
    : "Guest";

  const html = `<!doctype html><html><head><meta charset="utf-8" />
  <title>Yasir's Studio — conversation</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Inter, sans-serif; color: #0F2E27; margin: 0; padding: 40px; background: #FDF6EE; }
    .head { text-align: center; margin-bottom: 28px; }
    .logo { display:inline-flex; width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#288672,#36C9AB); color:#fff; align-items:center; justify-content:center; font-weight:800; font-style:italic; font-size:20px; }
    h1 { font-size: 20px; margin: 12px 0 2px; }
    .head .muted { color:#0F2E27aa; font-size: 13px; margin: 0; }
    .row { margin: 14px 0; max-width: 78%; }
    .row.them { margin-right: auto; }
    .row.me { margin-left: auto; text-align: right; }
    .who { font-size: 11px; font-weight: 700; color: #16584C; margin-bottom: 3px; }
    .bubble { display: inline-block; text-align: left; padding: 10px 14px; border-radius: 16px; background: #fff; box-shadow: 0 1px 4px #0f2e2718; }
    .row.me .bubble { background: #288672; color: #fff; }
    .bubble p { margin: 0 0 4px; font-size: 14px; line-height: 1.5; }
    .bubble p:last-child { margin-bottom: 0; }
    .bubble .muted { color: #0F2E2799; font-size: 12.5px; }
    .row.me .bubble .muted { color: #ffffffcc; }
    .sys { text-align: center; color: #0F2E2777; font-size: 12px; margin: 16px 0; }
    .foot { text-align:center; color:#0F2E2766; font-size:11px; margin-top: 30px; }
    @media print { body { background: #fff; } .bubble { box-shadow: none; border: 1px solid #0f2e2722; } }
  </style></head>
  <body>
    <div class="head">
      <div class="logo">YB</div>
      <h1>Yasir's Studio — conversation</h1>
      <p class="muted">${clientLine}</p>
    </div>
    ${rows}
    <div class="foot">Saved from chatwithyasir · yasirbashir.com</div>
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) {
    alert("Please allow pop-ups to save the conversation as PDF.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
