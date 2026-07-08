# The Calusa Times — Self-Hosting Guide

A step-by-step guide to run this app on your own server or cloud provider.

**Stack:** React 19 (Create React App) · FastAPI (Python 3.11) · MongoDB 7 · Optional: Resend (email), Pexels (stock images), Emergent LLM Key (AI summaries).

---

## 1. Get the code

In the Emergent chat input there's a **"Save to Github"** button. Use it to push the codebase to your own GitHub repo. Then:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git calusa-times
cd calusa-times
```

Your repo will have this shape:
```
calusa-times/
├── backend/            # FastAPI app
│   ├── server.py
│   ├── requirements.txt
│   ├── routes/
│   ├── services/
│   └── models.py
├── frontend/           # React app
│   ├── package.json
│   ├── src/
│   └── public/
└── uploads/            # user-uploaded images (needs to be persistent!)
```

---

## 2. Required accounts & API keys

All of these are **free to start**:

| Service | What it's for | Required? | Get key at |
|---|---|---|---|
| **MongoDB Atlas** (or any MongoDB 6+) | Database | ✅ Yes | https://www.mongodb.com/atlas |
| **Resend** | Admin & welcome emails | ⚪ Optional | https://resend.com |
| **Pexels** | Free stock-image search | ⚪ Optional | https://www.pexels.com/api/ |
| **OpenAI / Anthropic / Gemini** | AI article summaries for the newspaper | ⚪ Optional | — see below — |

> **About the AI summaries:** this no longer depends on Emergent at all. `backend/services/summarizer.py` uses `litellm` (already in `requirements.txt`) and auto-detects whichever key you set: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GEMINI_API_KEY`/`GOOGLE_API_KEY` (checked in that order). Set just one of them in `backend/.env` — no code changes needed. If none are set, the app still works (summaries just aren't generated; the newspaper falls back to the article description).

---

## 3. Environment variables

Create **`backend/.env`** from this template:

```bash
# === Database (required) ===
MONGO_URL=mongodb+srv://USER:PASS@cluster.mongodb.net
DB_NAME=calusa_times

# === Auth (required) ===
JWT_SECRET=change-me-to-a-long-random-string-at-least-32-chars
ADMIN_EMAIL=admin@calusaschool.org
ADMIN_PASSWORD=ChangeThisToASecurePassword!

# === Uploads (required) ===
UPLOADS_DIR=/app/uploads

# === Email notifications (optional) ===
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=The Calusa Times
# comma-separated fallback if no admin emails are set:
DEFAULT_ADMIN_EMAILS=you@yourdomain.com

# === Pexels free-image search (optional) ===
PEXELS_API_KEY=sfuH8ZEzFn...

# === AI summaries (optional) — pick ONE ===
# If you have an OpenAI key:
OPENAI_API_KEY=sk-...
# Or Anthropic:
ANTHROPIC_API_KEY=sk-ant-...
```

Create **`frontend/.env`**:
```bash
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

⚠️ If the backend and frontend share a domain (e.g. `yourdomain.com` serving both) set it to `https://yourdomain.com`. The app proxies anything starting with `/api` to FastAPI.

---

## 4. Quick-start with Docker (recommended)

Save this as **`Dockerfile.backend`** in the repo root:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn uvicorn[standard]

COPY backend/ ./backend/
WORKDIR /app/backend

ENV PYTHONPATH=/app/backend
ENV UPLOADS_DIR=/app/uploads
RUN mkdir -p /app/uploads

EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

Save this as **`Dockerfile.frontend`**:

```dockerfile
# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN yarn build

# ---- serve ----
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Save as **`nginx.conf`**:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    client_max_body_size 20M;

    # Proxy /api and /branding to the backend
    location /api/ {
        proxy_pass http://backend:8001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Save as **`docker-compose.yml`**:

```yaml
version: "3.9"

services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=calusa_times

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    restart: unless-stopped
    env_file: ./backend/.env
    environment:
      - MONGO_URL=mongodb://mongo:27017
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - mongo

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        REACT_APP_BACKEND_URL: ${REACT_APP_BACKEND_URL:-http://localhost}
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
  uploads_data:
```

**Run it:**
```bash
docker compose up -d --build
```

Visit `http://your-server-ip`. Log in at `/admin` with the email/password you set in `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## 5. Manual install (no Docker)

### Backend
```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# fill in .env (see section 3)
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
yarn install
# fill in .env (section 3)
yarn build    # production build goes to frontend/build/
```
Serve `frontend/build` with nginx / Caddy / Apache, and proxy `/api/*` to `http://localhost:8001`.

---

## 6. Seed initial data (optional)

After the first start, log in to `/admin` and create your articles, events, sponsors, etc. Or run these scripts in `backend/` to pre-populate:

```bash
cd backend
source .venv/bin/activate
python3 -c "
import asyncio, os, uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv()
async def main():
    c = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = c[os.environ['DB_NAME']]
    # Example: seed a first event so the ticker is non-empty
    await db.events.insert_one({
        'id': uuid.uuid4().hex,
        'title': 'Back-to-School Night',
        'category': 'PARENT',
        'start': datetime(2026, 8, 20, 18, 0),
        'end': datetime(2026, 8, 20, 20, 0),
        'is_active': True,
        'all_day': False,
        'created_at': datetime.utcnow(),
    })
    print('done')
asyncio.run(main())
"
```

The 6 **Parent Resource** category pages auto-create empty stubs the first time anyone visits `/school-info`.

---

## 7. Required persistent storage

The backend writes user-uploaded images to `UPLOADS_DIR` (default `/app/uploads/`). **This folder must survive container restarts.** Use a Docker volume (done in the compose file above), a mounted disk, or an S3-compatible store (you'd need to swap the file writes in `backend/routes/uploads.py` + `services/summarizer.py`).

---

## 8. Domain, HTTPS, DNS

- Point an `A` record for `yourdomain.com` to your server IP.
- Use **Caddy** or **Traefik** in front of the frontend container for automatic Let's Encrypt HTTPS. Example Caddyfile:

```
yourdomain.com {
    reverse_proxy localhost:80
}
```

- If you split frontend + backend across two hosts, set `REACT_APP_BACKEND_URL=https://api.yourdomain.com` in `frontend/.env` **before** building.

---

## 9. Cloud platform cheatsheets

### Render
- Create a **Web Service** for backend from `Dockerfile.backend`. Add env vars from section 3.
- Create a **Static Site** for frontend: build command `cd frontend && yarn install && yarn build`, publish dir `frontend/build`, env var `REACT_APP_BACKEND_URL=https://YOUR-BACKEND.onrender.com`.
- Add a **MongoDB** from Render's marketplace or use Mongo Atlas.
- Render wipes disk between deploys — use an external object store (S3) for `uploads/`.

### Railway
- Same idea: one service from `Dockerfile.backend`, one from `Dockerfile.frontend`. Add a **MongoDB plugin**. Attach a **volume** to the backend service mounted at `/app/uploads`.

### DigitalOcean App Platform
- Use `docker-compose.yml` directly with DigitalOcean's compose support. Attach a **DO Spaces** bucket for uploads if you want S3-style persistence.

### VPS (DigitalOcean Droplet / Linode / etc.)
- Install Docker + Docker Compose.
- Clone the repo.
- Create `.env` files.
- `docker compose up -d --build`.
- Put Caddy in front for HTTPS.

---

## 10. Backups

Back up **two** things:

1. **MongoDB** — daily `mongodump` is plenty:
   ```bash
   docker exec calusa-times-mongo-1 mongodump --archive --gzip > backup-$(date +%F).gz
   ```
2. **`uploads_data` volume** — just rsync it somewhere off-server nightly.

---

## 11. Things to double-check before go-live

- [ ] Change `JWT_SECRET` to a long random value (use `openssl rand -hex 32`).
- [ ] Change `ADMIN_PASSWORD` to something strong.
- [ ] In Resend, **verify your sending domain** (`calusaschool.org`) so admin notification emails don't go to spam.
- [ ] Set `RESEND_FROM_EMAIL` to an address on that verified domain.
- [ ] Enable HTTPS (Caddy or your cloud provider).
- [ ] Add the first article, first event, and your real school info at `/admin`.
- [ ] Test the printable newspaper at `/print` renders your real month's content.

---

## 12. Support

- **Emergent platform features** (billing, Universal Key, Save-to-GitHub): use the platform's support chat.
- **App bugs / feature requests**: keep iterating inside Emergent, then re-export via Save-to-GitHub.
- **Hosting issues**: check `docker compose logs backend` and `docker compose logs frontend` first.
