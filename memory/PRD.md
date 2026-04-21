# The Calusa Times — PRD

## Original Problem Statement
Build a pixel-perfect clone of a provided student newspaper site (calusa-kid-news.base44.app) evolved into a modern newspaper/gazette theme named **The Calusa Times**. Deliver a full backend CMS with image-uploaded articles, editable/deletable content, enable/disable comments, role-based admin auth, student art submission gallery, sponsor/ads page, info popups, and an interactive **Mural** cork board where parents can pay to post messages.

## User Preferences (explicit choices)
- **Preferred language**: English
- **Mural payment**: External link to **Givebacks** (not Stripe). Flow = parent submits message → saved as pending → clicks "Pay on Givebacks" (opens new tab) → admin manually verifies payment in Givebacks dashboard → approves on admin UI.
- **Mural pricing**: **Tiered** — $3 plain / $5 featured
- **Givebacks URL** (both tiers): `https://www.givebacks.com/causes/calusa/shop/items/50684`
- **Admin edit pages**: Full **dedicated edit pages** per item (not inline modals), with full image re-upload + preview for Articles and Sponsors.

## Architecture
- **Backend**: FastAPI (port 8001) — `/app/backend/server.py`
  - Routers under `/app/backend/routes/`: `auth`, `articles`, `comments`, `uploads`, `art`, `sponsors`, `popups`, `mural`
  - Pydantic models in `models.py`, `auth_models.py`
  - JWT auth (PyJWT), bcrypt passwords, role-based permissions (`viewer`/`editor`/`admin`)
  - Admin seed: `python /app/backend/create_admin.py` (idempotent upsert)
  - File uploads served under `/api/uploads/*`; stored in `/app/uploads/`
- **Frontend**: React + Tailwind + shadcn/ui (port 3000) — `/app/frontend/src`
  - Shared `lib/api.js` axios instance with JWT interceptor
  - `RequireAuth` component guards `/admin/*` routes with permission checks
  - Public pages fetch live backend data (no more mockData on Home/Articles/etc.)
  - Admin Dashboard + 8 management sections + dedicated edit pages (Article, User, Sponsor, Popup)
- **Database**: MongoDB; all responses exclude `_id`.

## Test Credentials
See `/app/memory/test_credentials.md`. Admin: `admin@calusaschool.org` / `Calusa2024!`

## Implemented (Feb 2026 — Iteration 3)
- ✅ JWT auth + role-based permissions (`upload`, `edit`, `delete`, `approve_comments`, `manage_users`)
- ✅ Protected `/admin/*` routes via `RequireAuth` (verifies via `/auth/me`)
- ✅ Articles CRUD with image upload + preview, featured toggle, comments toggle, view/click analytics
- ✅ Comments: public submission, admin moderation queue, approve/delete
- ✅ Users: list, create with role, change role, delete
- ✅ Sponsors: CRUD, logo upload, tiers (platinum/gold/silver/bronze), active flag
- ✅ Art: public submission, admin approve/feature/delete, image upload
- ✅ Popups: CRUD, activate/deactivate, expires_at, show_once, type variants
- ✅ Mural: Givebacks tiered pricing ($3 plain / $5 featured), public submission, admin approve/reject/delete, pending queue
- ✅ Admin Dashboard with live counts from backend
- ✅ Analytics page with real views/clicks/CTR
- ✅ Popup announcements hidden on `/admin/*` routes
- ✅ Consistent `data-testid` coverage on interactive elements
- ✅ Backend test suite: **34/34 passing** (`/app/backend/tests/backend_test.py`)
- ✅ Frontend E2E: **all 19 flows green**, including Givebacks new-tab + success card

## Key API Endpoints (admin-guarded ones require Bearer token)
- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/register`
- `GET/POST /api/articles`, `GET /api/articles/{id}`, `PUT/DELETE /api/articles/{id}` (admin)
- `POST /api/articles/upload-image` (admin), `POST /api/articles/{id}/upload-image` (admin)
- `GET /api/articles/{id}/analytics` (admin)
- `POST /api/comments`, `GET /api/comments/{article_id}`, admin: `PUT /{id}/approve`, `DELETE /{id}`, `GET /pending/all`
- `GET /api/sponsors`, admin: `POST/PUT/DELETE`, `POST /{id}/upload-logo`
- `GET/POST /api/art`, `POST /api/art/{id}/upload-image`, admin: `PUT /{id}/approve`, `PUT /{id}/feature`, `DELETE /{id}`, `GET /pending`
- `GET /api/popups`, admin: `GET /all`, `POST`, `PUT /{id}`, `PUT /{id}/deactivate`, `DELETE /{id}`
- `GET /api/mural`, `POST /api/mural`, `GET /api/mural/config/pricing`
- admin: `GET /api/mural/pending`, `PUT /{id}/approve`, `PUT /{id}/reject`, `DELETE /{id}`

## Prioritized Backlog
### P1 (next up)
- Gate `POST /api/auth/register` behind `manage_users` permission (or clamp public role to `viewer`) — flagged by backend testing agent as open-bootstrap.
- Gmail / SendGrid notification to admin when a pending mural message is submitted (so they know to verify payment).

### P2 (nice-to-have)
- Less intrusive popup UX (toast/banner instead of full-screen modal) — flagged by frontend testing agent.
- Public "Submit Story" / "Submit Art" flows should show a pending-approval state to the author rather than auto-publishing articles.
- Sort / filter / search on the Admin Articles list.
- Mural message auto-expiry after 30 days (field exists, not enforced yet).
- Separate "PTA parent login" tier with ability to self-approve their own paid mural message via Givebacks webhook (requires Givebacks API partnership).

### Refactor (tech debt)
- Move `/app/frontend/src/pages/Admin*.jsx` into a `/pages/admin/` subfolder for scalability.
- Delete `/app/frontend/src/mockData.js` — no longer referenced by any live page.

## Known Limitations
- Givebacks integration is **manual link-based** (by user choice). Admin must verify each payment in the Givebacks dashboard before approving on the Mural admin page.
- `POST /api/auth/register` is open by design so the admin can bootstrap more accounts without friction.
