# chatwithyasir — Admin Backend

A small API that powers **admin login** and a **captured-leads** inbox for the
chat. No external database: leads are stored in `data/leads.json`.

## Run locally

```bash
cd server
cp .env.example .env      # then edit ADMIN_PASSWORD + JWT_SECRET
npm install
npm run dev               # http://localhost:4000
```

Point the frontend at it by adding to the project root `.env`:

```
VITE_API_URL=http://localhost:4000
```

## Endpoints

| Method | Path                | Auth  | Purpose                              |
| ------ | ------------------- | ----- | ------------------------------------ |
| GET    | `/api/health`       | —     | Health check                         |
| POST   | `/api/admin/login`  | —     | `{ email, password }` → `{ token }`  |
| POST   | `/api/leads`        | —     | Capture a lead `{ name, email, … }`  |
| GET    | `/api/leads`        | admin | List captured leads (newest first)   |

## Production password

```bash
npm run hash "your-strong-password"   # prints a bcrypt hash
# put it in .env as ADMIN_PASSWORD_HASH and remove ADMIN_PASSWORD
```

## Deploy

Host this as a Node service (Railway, Render, Fly, a VPS, etc.). Set the env
vars there, then set `VITE_API_URL` in the frontend build to the deployed URL.
The frontend works fine **without** this server — lead capture and the admin
console simply stay dormant until `VITE_API_URL` is configured.
