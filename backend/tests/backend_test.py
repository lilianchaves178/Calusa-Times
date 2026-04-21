"""
End-to-end backend tests for The Calusa Times (iteration 2).
Covers: auth (admin guards), user management, articles CRUD + uploads + analytics,
comments, sponsors, art submissions, popups, and mural (Givebacks tiered pricing).

Iteration 2 changes:
- All admin-only endpoints (PUT/DELETE/approve/reject/upload on admin-guarded routes)
  now carry Bearer admin token.
- Added negative-auth tests:
    * admin endpoints without a token -> 401/403
    * admin endpoints with a viewer-role user token -> 403
- Confirms public non-admin flows still work without a token.
- Confirms no MongoDB _id leaks in GET responses.
"""
import io
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://kid-news-refresh.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@calusaschool.org"
ADMIN_PASSWORD = "Calusa2024!"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def viewer_user(session, auth_headers):
    """Register a viewer user for 403 permission testing. Register now requires admin token."""
    email = f"TEST_viewer_{uuid.uuid4().hex[:8]}@calusaschool.org"
    password = "Viewer123!"
    r = session.post(f"{API}/auth/register", json={
        "email": email, "password": password,
        "full_name": "Test Viewer", "role": "viewer"
    }, headers=auth_headers)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    login = session.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return {
        "id": data["id"],
        "email": email,
        "token": login.json()["access_token"],
        "headers": {"Authorization": f"Bearer {login.json()['access_token']}"},
    }


@pytest.fixture(scope="session")
def editor_user(session, auth_headers):
    """Register an editor user for role-based permission testing."""
    email = f"TEST_editor_{uuid.uuid4().hex[:8]}@calusaschool.org"
    password = "Editor123!"
    r = session.post(f"{API}/auth/register", json={
        "email": email, "password": password,
        "full_name": "Test Editor", "role": "editor"
    }, headers=auth_headers)
    assert r.status_code == 200, f"Editor register failed: {r.status_code} {r.text}"
    data = r.json()
    login = session.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return {
        "id": data["id"],
        "email": email,
        "token": login.json()["access_token"],
        "headers": {"Authorization": f"Bearer {login.json()['access_token']}"},
    }


def _assert_no_objectid(obj):
    if isinstance(obj, dict):
        assert "_id" not in obj, f"Found _id in response: {obj}"
        for v in obj.values():
            _assert_no_objectid(v)
    elif isinstance(obj, list):
        for v in obj:
            _assert_no_objectid(v)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body and isinstance(body["access_token"], str)
        assert body["token_type"] == "bearer"
        assert body["user"]["email"] == ADMIN_EMAIL
        assert body["user"]["role"] == "admin"
        assert "manage_users" in body["user"]["permissions"]

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG"})
        assert r.status_code == 401

    def test_login_unknown_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nobody@x.com", "password": "x"})
        assert r.status_code == 401

    def test_get_me_with_valid_token(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_get_me_missing_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_get_me_invalid_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# User management
# ---------------------------------------------------------------------------
class TestUserManagement:
    def test_register_new_user(self, session, auth_headers):
        email = f"TEST_user_{uuid.uuid4().hex[:8]}@calusaschool.org"
        r = session.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass123!",
            "full_name": "Test User", "role": "editor"
        }, headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == email
        assert body["role"] == "editor"
        assert "upload" in body["permissions"]
        session.delete(f"{API}/auth/users/{body['id']}", headers=auth_headers)

    def test_register_duplicate_email(self, session, auth_headers):
        r1 = session.post(f"{API}/auth/register", json={
            "email": ADMIN_EMAIL, "password": "x", "full_name": "x", "role": "viewer"
        }, headers=auth_headers)
        assert r1.status_code == 400

    def test_register_requires_admin_no_token(self, session):
        # Iteration 4: register now requires manage_users permission.
        r = session.post(f"{API}/auth/register", json={
            "email": f"TEST_notok_{uuid.uuid4().hex[:6]}@x.com",
            "password": "Pass123!", "full_name": "NoTok", "role": "viewer"
        })
        assert r.status_code in (401, 403), r.status_code

    def test_register_viewer_forbidden(self, session, viewer_user):
        r = session.post(f"{API}/auth/register", json={
            "email": f"TEST_viewerforbid_{uuid.uuid4().hex[:6]}@x.com",
            "password": "Pass123!", "full_name": "Forbid", "role": "viewer"
        }, headers=viewer_user["headers"])
        assert r.status_code == 403

    def test_register_editor_forbidden(self, session, editor_user):
        # editor does NOT have manage_users permission
        r = session.post(f"{API}/auth/register", json={
            "email": f"TEST_editorforbid_{uuid.uuid4().hex[:6]}@x.com",
            "password": "Pass123!", "full_name": "Forbid", "role": "viewer"
        }, headers=editor_user["headers"])
        assert r.status_code == 403

    def test_list_users_requires_permission(self, session, viewer_user):
        r = session.get(f"{API}/auth/users", headers=viewer_user["headers"])
        assert r.status_code == 403

    def test_list_users_admin(self, session, auth_headers):
        r = session.get(f"{API}/auth/users", headers=auth_headers)
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list)
        _assert_no_objectid(users)
        assert any(u["email"] == ADMIN_EMAIL for u in users)

    def test_update_role_and_delete(self, session, auth_headers):
        email = f"TEST_role_{uuid.uuid4().hex[:8]}@calusaschool.org"
        created = session.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass123!", "full_name": "Role Test", "role": "viewer"
        }, headers=auth_headers).json()
        uid = created["id"]

        r = session.put(f"{API}/auth/users/{uid}/role", params={"role": "editor"}, headers=auth_headers)
        assert r.status_code == 200

        users = session.get(f"{API}/auth/users", headers=auth_headers).json()
        target = next((u for u in users if u["id"] == uid), None)
        assert target and target["role"] == "editor"
        assert "upload" in target["permissions"]

        r = session.delete(f"{API}/auth/users/{uid}", headers=auth_headers)
        assert r.status_code == 200

        users_after = session.get(f"{API}/auth/users", headers=auth_headers).json()
        assert not any(u["id"] == uid for u in users_after)

    def test_update_role_viewer_forbidden(self, session, viewer_user):
        r = session.put(f"{API}/auth/users/some-id/role", params={"role": "admin"}, headers=viewer_user["headers"])
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# Articles
# ---------------------------------------------------------------------------
class TestArticles:
    @pytest.fixture(scope="class")
    def article_id(self, session, auth_headers):
        # POST /api/articles is PUBLIC (create remains open) - iteration 4: saved with approved=false
        r = session.post(f"{API}/articles", json={
            "category": "News", "title": "TEST Article",
            "description": "desc", "content": "content body",
            "author": "Tester", "grade": "5th", "comments_enabled": True
        })
        assert r.status_code == 200
        body = r.json()
        _assert_no_objectid(body)
        assert body["title"] == "TEST Article"
        assert body["views"] == 0
        # iteration 4: new articles default approved=False
        assert body.get("approved") is False, f"Expected approved=False, got {body.get('approved')}"
        aid = body["id"]
        # Approve so existing tests that fetch article publicly keep working
        ap = session.put(f"{API}/articles/{aid}/approve", headers=auth_headers)
        assert ap.status_code == 200
        assert ap.json()["approved"] is True
        yield aid
        # DELETE requires admin
        session.delete(f"{API}/articles/{aid}", headers=auth_headers)

    def test_list_articles_public(self, session, article_id):
        # article_id has been approved via fixture
        r = requests.get(f"{API}/articles")
        assert r.status_code == 200
        data = r.json()
        _assert_no_objectid(data)
        assert any(a["id"] == article_id for a in data)
        for a in data:
            assert a.get("approved") is True, f"Public list leaked unapproved article: {a['id']}"

    def test_get_article_public_increments_views(self, session, article_id):
        r1 = requests.get(f"{API}/articles/{article_id}")
        assert r1.status_code == 200
        v1 = r1.json()["views"]
        _assert_no_objectid(r1.json())
        r2 = requests.get(f"{API}/articles/{article_id}")
        assert r2.json()["views"] == v1 + 1

    def test_update_article_requires_admin(self, session, article_id, auth_headers, viewer_user):
        # Without token -> 401/403
        r_noauth = requests.put(f"{API}/articles/{article_id}", json={"title": "nope"})
        assert r_noauth.status_code in (401, 403), r_noauth.status_code
        # With viewer token -> 403
        r_viewer = requests.put(f"{API}/articles/{article_id}", json={"title": "nope"},
                                headers=viewer_user["headers"])
        assert r_viewer.status_code == 403
        # With admin token -> 200
        r = session.put(f"{API}/articles/{article_id}", json={"title": "TEST Updated"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST Updated"
        r2 = requests.get(f"{API}/articles/{article_id}")
        assert r2.json()["title"] == "TEST Updated"

    def test_click_public_and_analytics_admin(self, session, article_id, auth_headers, viewer_user):
        # POST click is public
        r = requests.post(f"{API}/articles/{article_id}/click")
        assert r.status_code == 200

        # Analytics without token -> 401/403
        a_noauth = requests.get(f"{API}/articles/{article_id}/analytics")
        assert a_noauth.status_code in (401, 403)

        # Analytics viewer -> 403
        a_viewer = requests.get(f"{API}/articles/{article_id}/analytics", headers=viewer_user["headers"])
        assert a_viewer.status_code == 403

        # Analytics admin -> 200 + no ObjectId
        analytics = session.get(f"{API}/articles/{article_id}/analytics", headers=auth_headers)
        assert analytics.status_code == 200, analytics.text
        data = analytics.json()
        _assert_no_objectid(data)
        assert data["article_id"] == article_id
        assert data["total_clicks"] >= 1
        # Regression: recent_activity must be list with no _id
        assert isinstance(data.get("recent_activity"), list)
        for act in data["recent_activity"]:
            assert "_id" not in act

    def test_standalone_image_upload_admin(self, auth_headers, viewer_user):
        files = {"file": ("test.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")}
        # No token -> 401/403
        r_no = requests.post(f"{API}/articles/upload-image", files=files)
        assert r_no.status_code in (401, 403)

        # Viewer -> 403
        files2 = {"file": ("test.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")}
        r_v = requests.post(f"{API}/articles/upload-image", files=files2, headers=viewer_user["headers"])
        assert r_v.status_code == 403

        # Admin -> 200
        files3 = {"file": ("test.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")}
        r = requests.post(f"{API}/articles/upload-image", files=files3, headers=auth_headers)
        assert r.status_code == 200, r.text
        url = r.json()["image_url"]
        assert url.startswith("/api/uploads/articles/")
        served = requests.get(f"{BASE_URL}{url}")
        assert served.status_code == 200
        assert len(served.content) > 0

    def test_article_image_upload_attaches_admin(self, session, article_id, auth_headers):
        files = {"file": ("a.jpg", io.BytesIO(b"fakejpeg"), "image/jpeg")}
        # No token -> 401/403
        r_no = requests.post(f"{API}/articles/{article_id}/upload-image",
                             files={"file": ("a.jpg", io.BytesIO(b"x"), "image/jpeg")})
        assert r_no.status_code in (401, 403)
        # Admin -> 200
        r = requests.post(f"{API}/articles/{article_id}/upload-image", files=files, headers=auth_headers)
        assert r.status_code == 200
        url = r.json()["image_url"]
        assert url.startswith("/api/uploads/articles/")
        article = requests.get(f"{API}/articles/{article_id}").json()
        assert article["image_url"] == url

    def test_delete_article_requires_admin_and_cascades(self, session, auth_headers, viewer_user):
        # Create dedicated article (public)
        a = session.post(f"{API}/articles", json={
            "category": "X", "title": "TEST Cascade", "description": "d",
            "content": "c", "author": "A", "comments_enabled": True
        }).json()
        aid = a["id"]
        c = session.post(f"{API}/comments", json={
            "article_id": aid, "author_name": "Parent", "content": "hi"
        })
        assert c.status_code == 200

        # No token -> 401/403
        d_no = requests.delete(f"{API}/articles/{aid}")
        assert d_no.status_code in (401, 403)
        # Viewer -> 403
        d_v = requests.delete(f"{API}/articles/{aid}", headers=viewer_user["headers"])
        assert d_v.status_code == 403

        # Admin -> 200
        d = session.delete(f"{API}/articles/{aid}", headers=auth_headers)
        assert d.status_code == 200
        r = requests.get(f"{API}/comments/{aid}")
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Iteration 4: Article approval workflow
# ---------------------------------------------------------------------------
class TestArticleApproval:
    @pytest.fixture
    def pending_article(self, session, auth_headers):
        r = session.post(f"{API}/articles", json={
            "category": "News", "title": f"TEST_Pending_{uuid.uuid4().hex[:6]}",
            "description": "d", "content": "c", "author": "T",
            "comments_enabled": True
        })
        assert r.status_code == 200
        body = r.json()
        assert body["approved"] is False
        yield body
        session.delete(f"{API}/articles/{body['id']}", headers=auth_headers)

    def test_public_create_saves_approved_false(self, pending_article):
        assert pending_article["approved"] is False
        _assert_no_objectid(pending_article)

    def test_public_list_excludes_unapproved(self, pending_article):
        r = requests.get(f"{API}/articles")
        assert r.status_code == 200
        ids = [a["id"] for a in r.json()]
        assert pending_article["id"] not in ids, "Public list leaked an unapproved article"

    def test_public_get_unapproved_returns_404(self, pending_article):
        r = requests.get(f"{API}/articles/{pending_article['id']}")
        assert r.status_code == 404

    def test_approved_only_false_flag(self, pending_article):
        # Spec says flag SHOULD honor opt-in
        r = requests.get(f"{API}/articles", params={"approved_only": "false"})
        assert r.status_code == 200
        ids = [a["id"] for a in r.json()]
        assert pending_article["id"] in ids, (
            "approved_only=false did not include the unapproved article - spec honors opt-in"
        )

    def test_pending_endpoint_requires_admin(self, pending_article, viewer_user, session, auth_headers):
        r_no = requests.get(f"{API}/articles/pending")
        assert r_no.status_code in (401, 403)
        r_v = requests.get(f"{API}/articles/pending", headers=viewer_user["headers"])
        assert r_v.status_code == 403
        r = session.get(f"{API}/articles/pending", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        _assert_no_objectid(data)
        assert any(a["id"] == pending_article["id"] for a in data)
        for a in data:
            assert a["approved"] is False

    def test_admin_all_requires_admin(self, pending_article, viewer_user, session, auth_headers):
        r_no = requests.get(f"{API}/articles/admin/all")
        assert r_no.status_code in (401, 403)
        r_v = requests.get(f"{API}/articles/admin/all", headers=viewer_user["headers"])
        assert r_v.status_code == 403
        r = session.get(f"{API}/articles/admin/all", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        _assert_no_objectid(data)
        ids = [a["id"] for a in data]
        assert pending_article["id"] in ids
        # admin/all should include both approved and unapproved
        statuses = {a["approved"] for a in data}
        assert False in statuses  # pending exists

    def test_approve_requires_admin_and_flips_visibility(self, pending_article, viewer_user, session, auth_headers):
        aid = pending_article["id"]
        r_no = requests.put(f"{API}/articles/{aid}/approve")
        assert r_no.status_code in (401, 403)
        r_v = requests.put(f"{API}/articles/{aid}/approve", headers=viewer_user["headers"])
        assert r_v.status_code == 403

        r = session.put(f"{API}/articles/{aid}/approve", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        _assert_no_objectid(body)
        assert body["approved"] is True
        assert body["id"] == aid

        pub_list = requests.get(f"{API}/articles").json()
        assert any(a["id"] == aid for a in pub_list)

        pub_detail = requests.get(f"{API}/articles/{aid}")
        assert pub_detail.status_code == 200
        assert pub_detail.json()["approved"] is True

    def test_round_trip_edit_unapproves(self, pending_article, session, auth_headers):
        aid = pending_article["id"]
        # First approve
        session.put(f"{API}/articles/{aid}/approve", headers=auth_headers)
        assert requests.get(f"{API}/articles/{aid}").status_code == 200
        # Now edit with approved=false
        r = session.put(f"{API}/articles/{aid}", json={"approved": False}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["approved"] is False
        # Public detail -> 404
        assert requests.get(f"{API}/articles/{aid}").status_code == 404
        # Public list excludes
        ids = [a["id"] for a in requests.get(f"{API}/articles").json()]
        assert aid not in ids


# ---------------------------------------------------------------------------
# Comments
# ---------------------------------------------------------------------------
class TestComments:
    @pytest.fixture(scope="class")
    def article_enabled(self, session, auth_headers):
        a = session.post(f"{API}/articles", json={
            "category": "C", "title": "TEST Comments On", "description": "d",
            "content": "c", "author": "A", "comments_enabled": True
        }).json()
        yield a["id"]
        session.delete(f"{API}/articles/{a['id']}", headers=auth_headers)

    @pytest.fixture(scope="class")
    def article_disabled(self, session, auth_headers):
        a = session.post(f"{API}/articles", json={
            "category": "C", "title": "TEST Comments Off", "description": "d",
            "content": "c", "author": "A", "comments_enabled": False
        }).json()
        yield a["id"]
        session.delete(f"{API}/articles/{a['id']}", headers=auth_headers)

    def test_create_comment_pending_public(self, session, article_enabled):
        r = requests.post(f"{API}/comments", json={
            "article_id": article_enabled, "author_name": "P1", "content": "nice"
        })
        assert r.status_code == 200
        body = r.json()
        _assert_no_objectid(body)
        assert body["approved"] is False

    def test_list_public_approved_only_default(self, article_enabled):
        r = requests.get(f"{API}/comments/{article_enabled}")
        assert r.status_code == 200
        _assert_no_objectid(r.json())
        for c in r.json():
            assert c["approved"] is True

    def test_approve_and_delete_admin(self, session, article_enabled, auth_headers, viewer_user):
        c = session.post(f"{API}/comments", json={
            "article_id": article_enabled, "author_name": "P2", "content": "approve me"
        }).json()
        cid = c["id"]
        # No token -> 401/403
        r_no = requests.put(f"{API}/comments/{cid}/approve")
        assert r_no.status_code in (401, 403)
        # Viewer -> 403
        r_v = requests.put(f"{API}/comments/{cid}/approve", headers=viewer_user["headers"])
        assert r_v.status_code == 403
        # Admin -> 200
        r = session.put(f"{API}/comments/{cid}/approve", headers=auth_headers)
        assert r.status_code == 200

        approved_list = requests.get(f"{API}/comments/{article_enabled}").json()
        assert any(x["id"] == cid for x in approved_list)

        # delete without token -> 401/403
        dn = requests.delete(f"{API}/comments/{cid}")
        assert dn.status_code in (401, 403)
        # delete admin -> 200
        r = session.delete(f"{API}/comments/{cid}", headers=auth_headers)
        assert r.status_code == 200

    def test_pending_all_admin(self, session, auth_headers, viewer_user):
        # No token -> 401/403
        r_no = requests.get(f"{API}/comments/pending/all")
        assert r_no.status_code in (401, 403)
        # Viewer -> 403
        r_v = requests.get(f"{API}/comments/pending/all", headers=viewer_user["headers"])
        assert r_v.status_code == 403
        # Admin -> 200
        r = session.get(f"{API}/comments/pending/all", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        _assert_no_objectid(data)
        for c in data:
            assert c["approved"] is False

    def test_comment_disabled_returns_403(self, article_disabled):
        r = requests.post(f"{API}/comments", json={
            "article_id": article_disabled, "author_name": "X", "content": "blocked"
        })
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# Sponsors
# ---------------------------------------------------------------------------
class TestSponsors:
    def test_list_public(self):
        r = requests.get(f"{API}/sponsors")
        assert r.status_code == 200
        _assert_no_objectid(r.json())

    def test_create_requires_admin(self, viewer_user):
        payload = {"name": "TEST NoAuth Sponsor", "tier": "gold"}
        # No token -> 401/403
        r_no = requests.post(f"{API}/sponsors", json=payload)
        assert r_no.status_code in (401, 403)
        # Viewer -> 403
        r_v = requests.post(f"{API}/sponsors", json=payload, headers=viewer_user["headers"])
        assert r_v.status_code == 403

    def test_sponsor_full_admin_crud(self, session, auth_headers):
        c = session.post(f"{API}/sponsors", json={
            "name": "TEST Sponsor", "tier": "gold", "website_url": "https://ex.com"
        }, headers=auth_headers)
        assert c.status_code == 200, c.text
        sid = c.json()["id"]
        assert c.json()["is_active"] is True

        # Public GET
        active = requests.get(f"{API}/sponsors").json()
        _assert_no_objectid(active)
        assert any(s["id"] == sid for s in active)

        # Update
        u = session.put(f"{API}/sponsors/{sid}", json={"name": "TEST Sponsor Renamed", "tier": "platinum"},
                        headers=auth_headers)
        assert u.status_code == 200
        assert u.json()["name"] == "TEST Sponsor Renamed"
        assert u.json()["tier"] == "platinum"

        # Logo upload admin
        files = {"file": ("logo.png", io.BytesIO(b"png"), "image/png")}
        lu = requests.post(f"{API}/sponsors/{sid}/upload-logo", files=files, headers=auth_headers)
        assert lu.status_code == 200
        assert lu.json()["logo_url"].startswith("/api/uploads/sponsors/")

        # Deactivate via update
        session.put(f"{API}/sponsors/{sid}", json={"is_active": False}, headers=auth_headers)
        active2 = requests.get(f"{API}/sponsors").json()
        assert not any(s["id"] == sid for s in active2)
        all_list = requests.get(f"{API}/sponsors", params={"active_only": "false"}).json()
        assert any(s["id"] == sid for s in all_list)

        # Delete
        d = session.delete(f"{API}/sponsors/{sid}", headers=auth_headers)
        assert d.status_code == 200


# ---------------------------------------------------------------------------
# Art
# ---------------------------------------------------------------------------
class TestArt:
    def test_art_flow_admin_guards(self, session, auth_headers, viewer_user):
        # Public create (students submit)
        c = requests.post(f"{API}/art", json={
            "title": "TEST Art", "artist_name": "Kiddo", "grade": "3rd", "description": "drawing"
        })
        assert c.status_code == 200
        aid = c.json()["id"]
        assert c.json()["approved"] is False

        # Public upload-image (students submit)
        files = {"file": ("p.png", io.BytesIO(b"png"), "image/png")}
        u = requests.post(f"{API}/art/{aid}/upload-image", files=files)
        assert u.status_code == 200
        assert u.json()["image_url"].startswith("/api/uploads/art/")

        # Public GET (approved only)
        approved_public = requests.get(f"{API}/art").json()
        _assert_no_objectid(approved_public)
        assert not any(a["id"] == aid for a in approved_public)

        # /pending requires admin
        r_no = requests.get(f"{API}/art/pending")
        assert r_no.status_code in (401, 403)
        r_v = requests.get(f"{API}/art/pending", headers=viewer_user["headers"])
        assert r_v.status_code == 403
        pending = session.get(f"{API}/art/pending", headers=auth_headers).json()
        assert any(a["id"] == aid for a in pending)

        # approve requires admin
        r_app_no = requests.put(f"{API}/art/{aid}/approve")
        assert r_app_no.status_code in (401, 403)
        session.put(f"{API}/art/{aid}/approve", headers=auth_headers)
        approved = requests.get(f"{API}/art").json()
        assert any(a["id"] == aid for a in approved)

        # feature toggle admin only
        r_feat_no = requests.put(f"{API}/art/{aid}/feature")
        assert r_feat_no.status_code in (401, 403)
        f1 = session.put(f"{API}/art/{aid}/feature", headers=auth_headers).json()
        assert f1["featured"] is True
        f2 = session.put(f"{API}/art/{aid}/feature", headers=auth_headers).json()
        assert f2["featured"] is False

        # delete admin only
        r_del_no = requests.delete(f"{API}/art/{aid}")
        assert r_del_no.status_code in (401, 403)
        d = session.delete(f"{API}/art/{aid}", headers=auth_headers)
        assert d.status_code == 200


# ---------------------------------------------------------------------------
# Popups
# ---------------------------------------------------------------------------
class TestPopups:
    def test_popup_flow_admin_guards(self, session, auth_headers, viewer_user):
        # Create admin only
        r_no = requests.post(f"{API}/popups", json={"title": "x", "message": "y", "type": "announcement"})
        assert r_no.status_code in (401, 403)
        r_v = requests.post(f"{API}/popups", json={"title": "x", "message": "y", "type": "announcement"},
                            headers=viewer_user["headers"])
        assert r_v.status_code == 403

        c = session.post(f"{API}/popups", json={
            "title": "TEST Popup", "message": "hi", "type": "announcement"
        }, headers=auth_headers)
        assert c.status_code == 200, c.text
        pid = c.json()["id"]

        # Public GET active
        active = requests.get(f"{API}/popups").json()
        _assert_no_objectid(active)
        assert any(p["id"] == pid for p in active)

        # /all admin only
        r_all_no = requests.get(f"{API}/popups/all")
        assert r_all_no.status_code in (401, 403)
        all_p = session.get(f"{API}/popups/all", headers=auth_headers).json()
        assert any(p["id"] == pid for p in all_p)

        # Update admin only
        r_u_no = requests.put(f"{API}/popups/{pid}", json={"title": "x"})
        assert r_u_no.status_code in (401, 403)
        u = session.put(f"{API}/popups/{pid}", json={"title": "TEST Popup Updated"}, headers=auth_headers)
        assert u.status_code == 200
        assert u.json()["title"] == "TEST Popup Updated"

        # Deactivate admin only
        r_d_no = requests.put(f"{API}/popups/{pid}/deactivate")
        assert r_d_no.status_code in (401, 403)
        d = session.put(f"{API}/popups/{pid}/deactivate", headers=auth_headers)
        assert d.status_code == 200
        active2 = requests.get(f"{API}/popups").json()
        assert not any(p["id"] == pid for p in active2)

        # Delete admin only
        r_del_no = requests.delete(f"{API}/popups/{pid}")
        assert r_del_no.status_code in (401, 403)
        session.delete(f"{API}/popups/{pid}", headers=auth_headers)


# ---------------------------------------------------------------------------
# Mural (Givebacks tiered pricing)
# ---------------------------------------------------------------------------
class TestMural:
    def test_pricing_config_public(self):
        r = requests.get(f"{API}/mural/config/pricing")
        assert r.status_code == 200
        data = r.json()
        assert data["tiers"] == {"plain": 3, "featured": 5}
        assert "givebacks" in data["givebacks_url"]
        # Iteration 5: display_days must be exposed
        assert data.get("display_days") == 30

    def test_mural_flow_with_admin_guards(self, session, auth_headers, viewer_user):
        # Public POST (plain tier)
        p = requests.post(f"{API}/mural", json={
            "message": "TEST plain msg", "author_name": "Parent A", "tier": "plain"
        })
        assert p.status_code == 200
        plain_id = p.json()["id"]
        assert p.json()["tier"] == "plain"
        assert p.json()["price"] == 3
        assert p.json()["paid"] is False and p.json()["approved"] is False

        # Public POST (featured tier)
        f = requests.post(f"{API}/mural", json={
            "message": "TEST featured msg", "author_name": "Parent B", "tier": "featured"
        })
        assert f.status_code == 200
        feat_id = f.json()["id"]
        assert f.json()["price"] == 5

        # Public GET
        public = requests.get(f"{API}/mural").json()
        _assert_no_objectid(public)
        assert not any(m["id"] == plain_id for m in public)

        # /pending admin only
        r_no = requests.get(f"{API}/mural/pending")
        assert r_no.status_code in (401, 403)
        r_v = requests.get(f"{API}/mural/pending", headers=viewer_user["headers"])
        assert r_v.status_code == 403
        pending = session.get(f"{API}/mural/pending", headers=auth_headers).json()
        ids = [m["id"] for m in pending]
        assert plain_id in ids and feat_id in ids

        # approve admin only
        r_app_no = requests.put(f"{API}/mural/{plain_id}/approve")
        assert r_app_no.status_code in (401, 403)
        ap = session.put(f"{API}/mural/{plain_id}/approve", headers=auth_headers)
        assert ap.status_code == 200
        assert ap.json()["paid"] is True and ap.json()["approved"] is True

        public2 = requests.get(f"{API}/mural").json()
        assert any(m["id"] == plain_id for m in public2)

        # reject admin only
        r_rej_no = requests.put(f"{API}/mural/{feat_id}/reject")
        assert r_rej_no.status_code in (401, 403)
        rj = session.put(f"{API}/mural/{feat_id}/reject", headers=auth_headers)
        assert rj.status_code == 200

        # delete admin only
        r_d_no = requests.delete(f"{API}/mural/{plain_id}")
        assert r_d_no.status_code in (401, 403)
        assert session.delete(f"{API}/mural/{plain_id}", headers=auth_headers).status_code == 200
        assert session.delete(f"{API}/mural/{feat_id}", headers=auth_headers).status_code == 200

    def test_mural_invalid_tier_defaults_to_plain(self, session, auth_headers):
        r = requests.post(f"{API}/mural", json={
            "message": "TEST bad tier", "author_name": "X", "tier": "premium"
        })
        assert r.status_code == 200
        assert r.json()["tier"] == "plain"
        assert r.json()["price"] == 3
        session.delete(f"{API}/mural/{r.json()['id']}", headers=auth_headers)


# ---------------------------------------------------------------------------
# Iteration 5: Mural 30-day auto-expiry from approval time
# ---------------------------------------------------------------------------
from datetime import datetime, timedelta
from pymongo import MongoClient


class TestMuralExpiry:
    @pytest.fixture(scope="class")
    def mongo_db(self):
        client = MongoClient(os.environ["MONGO_URL"])
        db = client[os.environ["DB_NAME"]]
        yield db
        client.close()

    def _create_msg(self, label="exp"):
        r = requests.post(f"{API}/mural", json={
            "message": f"TEST_{label}_{uuid.uuid4().hex[:6]}",
            "author_name": "Parent Exp",
            "tier": "plain",
        })
        assert r.status_code == 200, r.text
        return r.json()

    def test_create_pending_has_null_expires_at(self, session, auth_headers):
        body = self._create_msg("pendingnull")
        assert body["approved"] is False
        assert body["paid"] is False
        assert body.get("expires_at") in (None, ""), f"expected expires_at None, got {body.get('expires_at')}"
        session.delete(f"{API}/mural/{body['id']}", headers=auth_headers)

    def test_approve_sets_expires_at_30_days(self, session, auth_headers):
        body = self._create_msg("approve30")
        mid = body["id"]
        before = datetime.utcnow()
        ap = session.put(f"{API}/mural/{mid}/approve", headers=auth_headers)
        assert ap.status_code == 200
        data = ap.json()
        assert data["approved"] is True and data["paid"] is True
        assert data["expires_at"] is not None
        # Parse ISO and compute delta
        exp = datetime.fromisoformat(data["expires_at"].replace("Z", ""))
        delta_days = (exp - before).total_seconds() / 86400
        assert 29.5 <= delta_days <= 30.1, f"expected ~30 days, got {delta_days}"

        # Public list includes the approved message
        public = requests.get(f"{API}/mural").json()
        _assert_no_objectid(public)
        assert any(m["id"] == mid for m in public)

        # Admin include_expired=true also includes it
        all_admin = requests.get(f"{API}/mural", params={"include_expired": "true"}).json()
        assert any(m["id"] == mid for m in all_admin)

        session.delete(f"{API}/mural/{mid}", headers=auth_headers)

    def test_expired_excluded_from_public_included_with_flag(self, session, auth_headers, mongo_db):
        body = self._create_msg("expired")
        mid = body["id"]
        # approve to make it visible
        ap = session.put(f"{API}/mural/{mid}/approve", headers=auth_headers)
        assert ap.status_code == 200

        # Backdate expires_at directly via pymongo
        past = datetime.utcnow() - timedelta(days=1)
        res = mongo_db.mural_messages.update_one({"id": mid}, {"$set": {"expires_at": past}})
        assert res.matched_count == 1

        public = requests.get(f"{API}/mural").json()
        assert not any(m["id"] == mid for m in public), "expired message leaked into public list"

        admin_all = requests.get(f"{API}/mural", params={"include_expired": "true"}).json()
        assert any(m["id"] == mid for m in admin_all), "expired message missing from include_expired view"

        session.delete(f"{API}/mural/{mid}", headers=auth_headers)

    def test_extend_admin_only_and_resets_expiry(self, session, auth_headers, viewer_user, mongo_db):
        body = self._create_msg("extend")
        mid = body["id"]
        session.put(f"{API}/mural/{mid}/approve", headers=auth_headers)

        # Unauth -> 401/403
        r_no = requests.put(f"{API}/mural/{mid}/extend", params={"days": 30})
        assert r_no.status_code in (401, 403)
        # Viewer -> 403
        r_v = requests.put(f"{API}/mural/{mid}/extend", params={"days": 30}, headers=viewer_user["headers"])
        assert r_v.status_code == 403

        # Admin extend by 30 days
        before = datetime.utcnow()
        r30 = session.put(f"{API}/mural/{mid}/extend", params={"days": 30}, headers=auth_headers)
        assert r30.status_code == 200
        exp30 = datetime.fromisoformat(r30.json()["expires_at"].replace("Z", ""))
        d30 = (exp30 - before).total_seconds() / 86400
        assert 29.5 <= d30 <= 30.1, f"extend 30 -> got {d30} days"

        # Extend by 60 days
        before60 = datetime.utcnow()
        r60 = session.put(f"{API}/mural/{mid}/extend", params={"days": 60}, headers=auth_headers)
        assert r60.status_code == 200
        exp60 = datetime.fromisoformat(r60.json()["expires_at"].replace("Z", ""))
        d60 = (exp60 - before60).total_seconds() / 86400
        assert 59.5 <= d60 <= 60.1, f"extend 60 -> got {d60} days"

        # days<=0 should clamp to at least 1 day
        before0 = datetime.utcnow()
        r0 = session.put(f"{API}/mural/{mid}/extend", params={"days": 0}, headers=auth_headers)
        assert r0.status_code == 200
        exp0 = datetime.fromisoformat(r0.json()["expires_at"].replace("Z", ""))
        d0 = (exp0 - before0).total_seconds() / 86400
        assert 0.9 <= d0 <= 1.1, f"extend 0 should clamp to ~1 day, got {d0}"

        # negative also clamps to at least 1 day
        before_neg = datetime.utcnow()
        rn = session.put(f"{API}/mural/{mid}/extend", params={"days": -5}, headers=auth_headers)
        assert rn.status_code == 200
        expn = datetime.fromisoformat(rn.json()["expires_at"].replace("Z", ""))
        dn = (expn - before_neg).total_seconds() / 86400
        assert 0.9 <= dn <= 1.1, f"extend -5 should clamp to ~1 day, got {dn}"

        # Extend resurrects an expired message into public view
        past = datetime.utcnow() - timedelta(days=2)
        mongo_db.mural_messages.update_one({"id": mid}, {"$set": {"expires_at": past}})
        assert not any(m["id"] == mid for m in requests.get(f"{API}/mural").json())
        session.put(f"{API}/mural/{mid}/extend", params={"days": 30}, headers=auth_headers)
        assert any(m["id"] == mid for m in requests.get(f"{API}/mural").json())

        session.delete(f"{API}/mural/{mid}", headers=auth_headers)

    def test_extend_nonexistent_returns_404(self, session, auth_headers):
        r = session.put(f"{API}/mural/does-not-exist-{uuid.uuid4().hex[:6]}/extend",
                        params={"days": 30}, headers=auth_headers)
        assert r.status_code == 404

    def test_no_objectid_in_any_mural_response(self, session, auth_headers):
        body = self._create_msg("oidcheck")
        mid = body["id"]
        _assert_no_objectid(body)

        ap = session.put(f"{API}/mural/{mid}/approve", headers=auth_headers).json()
        _assert_no_objectid(ap)

        ext = session.put(f"{API}/mural/{mid}/extend", params={"days": 15}, headers=auth_headers).json()
        _assert_no_objectid(ext)

        _assert_no_objectid(requests.get(f"{API}/mural").json())
        _assert_no_objectid(requests.get(f"{API}/mural", params={"include_expired": "true"}).json())
        _assert_no_objectid(session.get(f"{API}/mural/pending", headers=auth_headers).json())

        session.delete(f"{API}/mural/{mid}", headers=auth_headers)


# ---------------------------------------------------------------------------
# Iteration 4: Email side-effect must never break creation
# (Resend may silently fail; creates MUST still return 200/201)
# ---------------------------------------------------------------------------
class TestEmailSilentFail:
    def test_article_create_returns_success_regardless_of_email(self, session, auth_headers):
        r = requests.post(f"{API}/articles", json={
            "category": "News", "title": f"TEST_EmailSilent_{uuid.uuid4().hex[:6]}",
            "description": "d", "content": "c", "author": "T", "comments_enabled": True
        })
        assert r.status_code == 200, r.text
        session.delete(f"{API}/articles/{r.json()['id']}", headers=auth_headers)

    def test_comment_create_returns_success_regardless_of_email(self, session, auth_headers):
        # Need an article with comments_enabled
        a = session.post(f"{API}/articles", json={
            "category": "X", "title": f"TEST_EmailComment_{uuid.uuid4().hex[:6]}",
            "description": "d", "content": "c", "author": "A", "comments_enabled": True
        }).json()
        c = requests.post(f"{API}/comments", json={
            "article_id": a["id"], "author_name": "P", "content": "hello"
        })
        assert c.status_code == 200, c.text
        session.delete(f"{API}/articles/{a['id']}", headers=auth_headers)

    def test_art_create_returns_success_regardless_of_email(self, session, auth_headers):
        r = requests.post(f"{API}/art", json={
            "title": f"TEST_EmailArt_{uuid.uuid4().hex[:6]}",
            "artist_name": "Kid", "grade": "3rd", "description": "d"
        })
        assert r.status_code == 200, r.text
        session.delete(f"{API}/art/{r.json()['id']}", headers=auth_headers)

    def test_mural_create_returns_success_regardless_of_email(self, session, auth_headers):
        r = requests.post(f"{API}/mural", json={
            "message": f"TEST_EmailMural_{uuid.uuid4().hex[:6]}",
            "author_name": "Parent", "tier": "plain"
        })
        assert r.status_code == 200, r.text
        session.delete(f"{API}/mural/{r.json()['id']}", headers=auth_headers)


# ---------------------------------------------------------------------------
# Uploads serving
# ---------------------------------------------------------------------------
class TestUploads:
    def test_upload_and_fetch_admin(self, auth_headers):
        files = {"file": ("probe.png", io.BytesIO(b"\x89PNGprobe"), "image/png")}
        r = requests.post(f"{API}/articles/upload-image", files=files, headers=auth_headers)
        assert r.status_code == 200
        url = r.json()["image_url"]
        served = requests.get(f"{BASE_URL}{url}")
        assert served.status_code == 200
        assert b"probe" in served.content

    def test_upload_nonexistent(self):
        r = requests.get(f"{API}/uploads/articles/does-not-exist.png")
        assert r.status_code == 404
