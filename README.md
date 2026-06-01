# Conversational Portfolio — Yasir Bashir

A portfolio website that behaves like a **live chat**. The page opens with a
greeting and a centered message box; as the visitor types (or taps quick-reply
chips), the page flows like a messaging thread. Gen-Z, fun, minimalist — built
on an Apple-style **liquid-glass** aesthetic in Yasir's teal/cream/gold brand.

## Concept

- Lands as a chat: _"Hey 👋 I'm Yasir's site — let's skip the boring scroll."_
- Visitor types a question → bot "types" → answers stream in as glass bubbles.
- Rich bubbles: stat cards, service chips, CTA buttons, contact links.
- **Scripted brain, no API** — answers route by quick-reply chip id, or by
  keyword scoring on free text (`src/lib/match.ts`). Zero cost, instant, offline.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS 3** (brand tokens in `tailwind.config.js`)
- **framer-motion** for bubble spring animations
- Fonts: Bricolage Grotesque · Inter · Playfair Display italic

## Brand

| Token | Hex |
| --- | --- |
| Teal | `#288672` |
| Teal light | `#36C9AB` |
| Teal dark | `#165A4C` |
| Ink | `#0F2E27` |
| Cream | `#F9EBDC` |
| Gold | `#E2A93C` |

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

## Edit the conversation

All copy lives in **`src/data/conversation.ts`**:

- `GREETING` — opening bubbles.
- `OPENING_CHIPS` — first quick-reply chips (by answer `id`).
- `ANSWERS[]` — each topic: `chip` label, `keywords` (route free text),
  `bubbles` (the reply), and `followups` (next chips).

Add a new topic = push one `Answer` object. No component changes needed.

## Folder structure

```
conversational-portfolio/
├── public/            # favicon
├── src/
│   ├── components/    # BotBubble renderer, TypingDots
│   ├── data/          # conversation.ts — the scripted brain
│   ├── lib/           # match.ts — keyword router
│   ├── App.tsx        # chat shell, streaming, composer
│   ├── main.tsx
│   └── index.css      # Tailwind + liquid-glass utilities
└── README.md
```
