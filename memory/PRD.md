# The Calusa Times — PRD

## Original Problem Statement
Build a pixel-perfect clone of a provided student newspaper site (calusa-kid-news.base44.app) evolved into a modern newspaper/gazette theme named **The Calusa Times**. Deliver a full backend CMS with image-uploaded articles, editable/deletable content, enable/disable comments, role-based admin auth, student art submission gallery, sponsor/ads page, info popups, and an interactive **Mural** cork board where parents can pay to post messages.

## User Preferences (explicit)
- **Preferred language**: English
- **Mural payment**: External link to **Givebacks** (not Stripe). Flow = parent submits message → saved pending → opens Givebacks in new tab → admin manually verifies payment & approves.
- **Mural pricing**: Tiered — **$3 plain / $5 featured**
- **Givebacks URL** (both tiers): `https://www.givebacks.com/causes/calusa/shop/items/50684`
- **Admin edit pages**: Full dedicated edit pages per item (not inline), image re-upload + preview for Articles and Sponsors.
- **Email notifications**: **Resend** (key already installed). Recipient: all `admin`-role users. Triggers: pending Mural message, pending Article submission, pending Art submission, pending Comment.

## Architecture
- **Backend**: FastAPI `/app/backend/server.py` — routers under `/app/backend/routes/`: `auth`, `articles`, `comments`, `uploads`, `art`, `sponsors`, `popups`, `mural`. Pydantic models in `models.py` / `auth_models.py`. Services under `/app/backend/services/` (currently: `email_service.py`).
- **Auth**: JWT (PyJWT + bcrypt) with roles `viewer` / `editor` / `admin`. Admin user seeded via `python /app/backend/create_admin.py` (idempotent, upserts both admin accounts).
- **Storage**: MongoDB; `_id` is always projected out. Uploaded files under `/app/uploads/*`, served via `/api/uploads/*`.
- **Frontend**: React + Tailwind + shadcn/ui. Shared `lib/api.js` axios with JWT interceptor. `RequireAuth` component guards every `/admin/*` route with permission checks. Public pages fetch live backend data.
- **Email**: Resend via `/app/backend/services/email_service.py`. Fire-and-forget, silently no-op if `RESEND_API_KEY` unset. Templates use inline-CSS HTML.

## Test Credentials
See `/app/memory/test_credentials.md`.

## Implemented (Feb 2026)
### Iteration 1–3
- JWT auth + role-based permissions (`upload`, `edit`, `delete`, `approve_comments`, `manage_users`)
- `RequireAuth` route guard; all `/admin/*` routes protected
- Articles CRUD with image upload/preview, featured toggle, comments toggle
- Comments: public submission, admin moderation queue
- Users: list/create/change-role/delete (admin only)
- Sponsors: CRUD, logo upload, tiers (platinum/gold/silver/bronze), active flag
- Art: public submission, admin approve/feature/delete
- Popups: CRUD, activate/deactivate, expires_at, show_once, type variants
- Mural: Givebacks tiered pricing ($3 plain / $5 featured), public submission, admin approve/reject/delete
- Dashboard with live counts + Analytics page with real stats
- Popup announcements hidden on `/admin/*`
- `data-testid` coverage on all interactive admin elements

### Iteration 4 (Feb 21, 2026)
- 🔒 `POST /api/auth/register` now requires admin token (`manage_users` permission). Public self-registration blocked.
- ⏳ **Articles approval workflow**: `approved` field on Article model (default False). Public GET filters approved-only; unapproved article detail returns 404. New admin endpoints: `GET /articles/pending`, `GET /articles/admin/all`, `PUT /articles/{id}/approve`. Existing articles backfilled to `approved=true`.
- 🔎 Admin Articles list has search (title/author/description), category filter, sort (date/views/title), and **All/Pending/Published** tabs. In-row **Approve** button on pending articles.
- 📧 **Email notifications via Resend** — fire-and-forget to all admin-role users on: pending Mural message, pending Article submission, pending Art submission, pending Comment. Silent-fail so creates never break.
- Second admin (`lilian.chaves1@gmail.com`) seeded + promoted to admin for Resend test-mode email delivery.
- Public SubmitStory/SubmitArt pages now message "will appear after an editor approves it".

## Key API Endpoints (admin-guarded ones need Bearer token)
- **Auth**: `POST /login`, `GET /me`, admin: `POST /register`, `GET/DELETE /users`, `PUT /users/{id}/role`
- **Articles**: `GET/POST /articles`, `GET /articles/{id}`, `GET /articles/photos-of-the-week`, `POST /articles/{id}/click`. Admin: `PUT /articles/{id}`, `DELETE /articles/{id}`, `PUT /articles/{id}/approve`, `GET /articles/pending`, `GET /articles/admin/all`, `GET /articles/{id}/analytics`, `POST /articles/upload-image`, `POST /articles/{id}/upload-image`
- **Comments**: `GET /comments/{article_id}`, `POST /comments`. Admin: `PUT /{id}/approve`, `DELETE /{id}`, `GET /pending/all`
- **Sponsors**: `GET /sponsors`. Admin: `POST/PUT/DELETE`, `POST /{id}/upload-logo`
- **Art**: `GET/POST /art`, `POST /art/{id}/upload-image`. Admin: `PUT /{id}/approve`, `PUT /{id}/feature`, `DELETE /{id}`, `GET /pending`
- **Popups**: `GET /popups`. Admin: `GET /all`, `POST`, `PUT /{id}`, `PUT /{id}/deactivate`, `DELETE /{id}`
- **Mural**: `GET /mural`, `POST /mural`, `GET /mural/config/pricing`. Admin: `GET /pending`, `PUT /{id}/approve`, `PUT /{id}/reject`, `DELETE /{id}`
- **Pexels**: `GET /pexels/search?q=...`, `POST /pexels/import` (body `{url, target}` where target ∈ `articles|spotlight|school|art|sponsors`)

## Test Coverage
- Backend: **49/49 pytest green** (`/app/backend/tests/backend_test.py`)
- Frontend E2E: all 19 tested flows green (iteration 3)

### Iteration 5 (Feb 21, 2026)
- ⏲ **30-day Mural auto-expiry** enforced. On admin approval, `expires_at = now + 30 days`. Public `GET /api/mural` excludes expired messages by default; admins pass `?include_expired=true` to see them. New **`PUT /api/mural/{id}/extend?days=N`** (admin) to reset or extend a message's display window (defaults to 30). Admin Mural page now shows expiry date on each approved message with a **+30 days** button. `GET /api/mural/config/pricing` now returns `display_days` for frontend copy.
- Backend: **55/55 pytest green** — includes 6 new expiry test cases.

### Iteration 7 (Feb 22, 2026)
- 🖼 **Pexels free-image search** integrated across all 4 image-upload surfaces:
  - `/submit-story` (public SubmitStoryPage) — student picks a stock photo when they don't have their own picture.
  - `/submit-art` (public SubmitArtPage) — art submission now accepts either a file OR a Pexels photo (file no longer required when a stock image is selected).
  - `/spotlight` (public self-submit) — optional stock photo for the student's shine story.
  - `/admin/articles/:id/edit` (AdminArticleEditPage) — picker renders next to the multi-file input; for existing articles, picked photos are appended to `images` via `PUT /articles/{id}`; for new articles, they are staged in-form.
- Backend: new `/api/pexels/search` + `/api/pexels/import` proxy (API key never hits the browser). `ArtSubmissionCreate` and `SpotlightPublicSubmit` gained optional `image_url` for direct Pexels-import flows. `create_article` coerces `images=None → []` to handle old clients.
- Frontend: `PexelsImagePicker.jsx` (portal-free modal, Enter-to-search, per-photo import, `target` prop selects uploads subfolder). No nested `<form>` (HTML-valid inside parent submission forms).
- Tests: Pexels suite **12/12** green. 4/4 end-to-end submission flows verified with playwright. 0 hydration errors across consumer pages.

### Iteration 8 (Feb 22, 2026)
- 📸 **Photo of the Week** — new auto-rotating slot on the homepage (between the Featured Story and Latest Stories). Pulls all images from approved articles in the last 14 days (backfills with older approved ones if fewer than 8 are available), auto-advances every 5s, pauses on hover, each slide links directly to the article. Works as a showcase for newly submitted stories (now effortless with the Pexels picker) — designed to bring parents back weekly.
- Backend: `GET /api/articles/photos-of-the-week?limit=8` returns `{photos: [{article_id, title, author, category, image_url, date}]}`. Route registered before `/{article_id}` to avoid path collision.
- Frontend: `components/PhotoOfTheWeek.jsx` — gracefully hides when no photos exist; keyboard-accessible nav arrows on hover; progress dots with active-slide highlight.

## Backlog
### P1
- **Verify `calusaschool.org` domain in Resend** so notifications can reach every admin account (not just `lilian.chaves1@gmail.com`). Step-by-step: Resend Dashboard → Domains → Add Domain → add DNS TXT/MX records → update `SENDER_EMAIL` in `.env` to e.g. `news@calusaschool.org`.
- Nightly digest email summarising all items still pending approval.

### P2
- Less intrusive popup UX (toast/banner instead of full-screen modal).
- Sort/filter/search on Admin Comments, Sponsors, Art, Popups, Mural lists (only Articles has it today).
- Mural message 30-day auto-expiry (field exists, enforcement missing). ✅ done (Iter 5)
- Givebacks webhook listener for auto-approval on payment (would require partnership access).

### Tech debt
- Move `/app/frontend/src/pages/Admin*.jsx` into `/pages/admin/` subfolder.
- Delete `/app/frontend/src/mockData.js` — no longer referenced by any live page.
- Pin `bcrypt<5` or `passlib>=1.7.5` to silence the harmless `__about__` warning.

## Known Limitations
- Givebacks integration is **manual link-based** (user's explicit choice).
- Resend free tier is in "test mode" until a sending domain is verified — emails to any address other than the Resend account owner's will fail silently.
