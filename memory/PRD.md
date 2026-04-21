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
- **Contact**: `POST /contact` (public). Admin: `GET /contact?resolved=true|false`, `PUT /contact/{id}/resolve?resolved=bool`, `DELETE /contact/{id}`
- **Subscribers**: `POST /subscribers` (public, idempotent), `POST /subscribers/unsubscribe`. Admin: `GET /subscribers?active_only=true|false`, `DELETE /subscribers/{id}`
- **Print edition**: `GET /articles/print-edition?month=YYYY-MM` (public) → `{articles: [...with cached ai_summary], achievements: [...]}`
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

### Iteration 9 (Feb 22, 2026)
- 🏆 **Achievement pictures** — admins can now attach a real photo (upload OR Pexels) to each achievement instead of the generic trophy icon. Backend: `Achievement.image_url: Optional[str]` on model/create/update + new `POST /api/achievements/{aid}/upload-image` (admin-only). Pexels importer now accepts `target=achievements` which lands files in `/app/uploads/achievements/`.
- Frontend (`AdminAchievementsPage.jsx`): new "Picture (optional)" block in the edit form with file input, Pexels "Browse free images" button, live preview, and a small × to remove. Row list swaps the trophy disc for a 56px thumbnail when an image is set. Homepage `AchievementsSection` uses a circular photo avatar when present; `AchievementsPage` renders a 16:10 hero image at the top of the card when present and collapses the ribbon slot.
- Verified end-to-end via curl (create + file upload + Pexels import) and UI screenshot of the admin form. Falls back to the ribbon icon whenever `image_url` is empty, so existing rows without photos are unaffected.

### Iteration 10 (Feb 22, 2026)
- 🎞 **Photo of the Week — multi-source mix**: the homepage slideshow now aggregates fresh imagery from **articles**, **achievements**, **student art**, and **spotlight** submissions (previously articles only). Each slide carries a coloured source chip: STEM-blue "NEWS" etc. for articles, gold `🏆 ACHIEVEMENT`, pink `🎨 STUDENT ART`, purple `✨ SPOTLIGHT`. Clicking routes to the right destination (`/article/:id`, `/achievements`, `/student-art`, `/spotlight`). Each photo has a context-aware subtitle ("Awarded to …", "By …", etc.).
- Backend: `GET /api/articles/photos-of-the-week` still at the same path but now returns `{photos: [{source, link, title, subtitle, category, image_url, date}]}` merged from 4 collections, filtered to approved/active items with non-empty image_url, preferring the last 14 days and backfilling with older items. De-dupes by image URL.
- Frontend: `PhotoOfTheWeek.jsx` rewritten to render `source`-specific chips + icons (Newspaper / Trophy / Palette / Sparkles). Testids `potw-chip-article|achievement|art|spotlight` for easy QA.
- Smoke-tested: `{'achievement': 1, 'spotlight': 2, 'art': 1, 'article': 3}` returned by the API; playwright cycling confirmed all four chip types render.

### Iteration 11 (Feb 22, 2026)
- 🐛 **Bug fix — achievement images 404'd**: `/api/uploads/achievements/*` route was missing in `routes/uploads.py`. Added `serve_achievement_image` handler; now `HTTP 200` everywhere the photos render (admin list, homepage widget, Photo of the Week, public Achievements page).
- 🎨 **Photo of the Week now aspect-adaptive**: images no longer get cropped by `object-cover`. The slide now uses `object-contain` for the main photo and fills any letterbox gap with a blurred, darkened copy of the same image as a backdrop, so portrait uploads (like the STEM Award banner) and landscape photos both display fully and look polished.

### Iteration 12 (Feb 22, 2026)
- 📮 **Contact Us**: public page at `/contact` (form: name, email, subject, related-article dropdown, message), new backend `routes/contact.py` (model `ContactMessage` + `POST /api/contact` public + admin CRUD). Admin inbox at `/admin/contact` with **Open/Resolved/All** tabs, Reply (mailto), Mark resolved / Reopen, and Delete. New Resend email template `notify_new_contact`. Dashboard tile shows open-message count.
- 🗞 **Printable monthly edition**: admin page at `/admin/print` with a month picker (defaults to current month). Renders a pair of 8.5×11 sheets styled as a true mini-gazette — masthead "The Calusa Times · {Month Year}", lead-article hero + two-column stories on page 1, continuation on page 2 with an "Achievements of the Month" strip. Uses `@page { size: Letter; margin: 0.5in; }` + `@media print` to produce a clean PDF when the admin hits **Print / Save as PDF**. Auto-truncates article bodies to avoid overflow. Dashboard tile links to it.
- Files: `backend/routes/contact.py`, `services/email_service.py::notify_new_contact`, `frontend/src/pages/ContactPage.jsx`, `AdminContactPage.jsx`, `AdminPrintPage.jsx`, `AdminPrintPage.css`. Header nav gained a "Contact" link.

### Iteration 13 (Feb 22, 2026)
- 📰 **Public monthly newspaper download**: extracted printable render into reusable `components/PrintableNewspaper.jsx`. New public page `/print` uses the same 2-sheet gazette layout and public (approved-only) API endpoints. Supports `?month=YYYY-MM` and `?autoprint=1` for deep-linkable downloads. Homepage footer now sports a gold **"This Month's Newspaper"** button linking here.
- 🧹 **Header decluttered**: removed the Submit and Admin buttons from the desktop header. Both CTAs (plus the new This-Month's-Newspaper link) now live in a new **three-column footer** (brand · CTAs · social/school links), with a copyright strip at the bottom. Mobile hamburger menu still carries Submit + Admin for small-screen users.
- Files: `components/PrintableNewspaper.jsx` (new), `pages/PrintPage.jsx` (new public route), `components/Footer.jsx` (rewrite), `components/Header.jsx` (trim), `App.js` (add `/print` route).

### Iteration 14 (Feb 23, 2026)
- 🧠 **AI article summaries** — integrated Emergent LLM key (Claude Sonnet 4.5). New `backend/services/summarizer.py` with `summarize_article(title, body)` (3-4 sentences, ≤60 words, no hallucinations). Article model gained `ai_summary: Optional[str]`; new `GET /api/articles/print-edition?month=YYYY-MM` returns articles with cached summaries (generates on first read, then caches on the document).
- 📄 **Printable newspaper redesign** — text-first: each story now renders its AI summary beside a smaller floated thumbnail (lead = 2.2in, column = 1.1in; text wraps). Layout is adaptive:
  - ≤3 articles → **single sheet** (1 of 1) with achievements inlined at the bottom. No more orphaned page 2.
  - \>3 articles → two sheets, achievements land on whichever page has room.
- 📬 **Email subscriptions** — new `backend/routes/subscriptions.py` (`Subscriber` model, idempotent `POST /api/subscribers`, `POST /api/subscribers/unsubscribe`, admin list/delete) + Resend welcome email. Footer now has a pill-style email capture "Remind me when the new issue is out" with inline success state.
- Files: `backend/services/summarizer.py`, `backend/routes/subscriptions.py`, `backend/models.py` (ai_summary), `backend/routes/articles.py` (print-edition), `backend/server.py` (wire), `frontend/src/components/PrintableNewspaper.jsx` (rewrite for adaptive layout + AI summary body), `frontend/src/pages/AdminPrintPage.css` (smaller floated thumbs), `frontend/src/pages/PrintPage.jsx` + `AdminPrintPage.jsx` (call `/print-edition`), `frontend/src/components/Footer.jsx` (subscribe form).

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
