# chatwithyasir — Live Chat Backend

Powers three things for the chat:

1. **Durable capture** — every visitor (name, email, full transcript) is stored
   in Postgres (Neon).
2. **Email alerts** — Yasir gets an email the moment a visitor opens a chat.
3. **Live join** — Yasir sees conversations and chats two-way in real time
   (Socket.IO). When he joins, the front-end AI yields to him.

## Run locally

```bash
cd server
cp .env.example .env      # fill in DATABASE_URL, SMTP_*, ADMIN_PASSWORD, JWT_SECRET
npm install
npm run dev               # http://localhost:4000
```

Point the frontend at it by adding to the project root `.env`:

```
VITE_API_URL=http://localhost:4000
```

You need a Postgres database (free at [neon.tech](https://neon.tech)) — paste its
connection string into `DATABASE_URL`. The schema is created automatically on boot.

## Endpoints (REST)

| Method | Path                          | Auth  | Purpose                                  |
| ------ | ----------------------------- | ----- | ---------------------------------------- |
| GET    | `/api/health`                 | —     | Health check                             |
| POST   | `/api/admin/login`            | —     | `{ email, password }` → `{ token }`      |
| POST   | `/api/conversation`           | —     | Start a chat `{ name, email }` → ids; emails Yasir |
| POST   | `/api/message`                | token | Append a visitor/AI message              |
| GET    | `/api/admin/conversations`    | admin | List conversations (newest first)        |
| GET    | `/api/admin/conversations/:id`| admin | Full transcript                          |

## Real-time (Socket.IO)

- **Visitor** connects with `{ conversationId, visitorToken }`; receives Yasir's
  replies, the "Yasir joined" line, and the `human_active` signal.
- **Admin** connects with `{ token: <JWT> }`; receives `admin:new` /
  `admin:update`, can `admin:open`, `admin:join` (→ AI yields), and send messages.

## Production password

```bash
npm run hash "your-strong-password"   # prints a bcrypt hash
# put it in .env as ADMIN_PASSWORD_HASH and remove ADMIN_PASSWORD
```

## Email alerts (Gmail)

Uses Nodemailer over Gmail SMTP. On the alert account (e.g. yasirbashirai@gmail.com):
enable 2-Step Verification, create an **App Password**
(<https://myaccount.google.com/apppasswords>), and set it as `SMTP_PASS`
(with `SMTP_USER` = that Gmail address).

## Deploy (Render)

Host as a Node web service (Render free tier works; it sleeps after ~15 min idle).
Root directory `server`, build `npm install`, start `npm start`. Set all env vars
from `.env.example` there, then set `VITE_API_URL` in the Vercel frontend to the
`.onrender.com` URL and redeploy.

The frontend works fine **without** this server — capture, alerts, and live join
simply stay dormant until `VITE_API_URL` is configured.
