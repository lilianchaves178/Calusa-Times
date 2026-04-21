"""
End-to-end backend tests for The Calusa Times.
Covers: auth, user management, articles CRUD + uploads + analytics,
comments, sponsors, art submissions, popups, and mural (Givebacks tiered pricing).
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
def viewer_user(session):
    """Register a viewer user for 403 permission testing."""
    email = f"TEST_viewer_{uuid.uuid4().hex[:8]}@calusaschool.org"
    password = "Viewer123!"
    r = session.post(f"{API}/auth/register", json={
        "email": email, "password": password,
        "full_name": "Test Viewer", "role": "viewer"
    })
    assert r.status_code == 200, f"Register failed: {r.text}"
    data = r.json()
    # Login to get token
    login = session.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return {
        "id": data["id"],
        "email": email,
        "token": login.json()["access_token"],
        "headers": {"Authorization": f"Bearer {login.json()['access_token']}"},
    }


def _assert_no_objectid(obj):
    """Recursive check that MongoDB _id is NOT present in any JSON payload."""
    if isinstance(obj, dict):
        assert "_id" not in obj, f"Found _id in response: {obj}"
        for v in obj.values():
            _assert_no_objectid(v)
    elif isinstance(obj, list):
        for v in obj:
            _assert_no_objectid(v)


# ---------------------------------------------------------------------------
# Auth tests
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

    def test_get_me_missing_token(self, session):
        # Using a fresh session to avoid leaked auth headers
        r = requests.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_get_me_invalid_token(self, session):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# User management
# ---------------------------------------------------------------------------
class TestUserManagement:
    def test_register_new_user(self, session):
        email = f"TEST_user_{uuid.uuid4().hex[:8]}@calusaschool.org"
        r = session.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass123!",
            "full_name": "Test User", "role": "editor"
        })
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == email
        assert body["role"] == "editor"
        assert "upload" in body["permissions"]
        # cleanup
        login = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        token = login.json()["access_token"]
        session.delete(f"{API}/auth/users/{body['id']}", headers={"Authorization": f"Bearer {token}"})

    def test_register_duplicate_email(self, session):
        r1 = session.post(f"{API}/auth/register", json={
            "email": ADMIN_EMAIL, "password": "x", "full_name": "x", "role": "viewer"
        })
        assert r1.status_code == 400

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
        # Create a throwaway user
        email = f"TEST_role_{uuid.uuid4().hex[:8]}@calusaschool.org"
        created = session.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass123!", "full_name": "Role Test", "role": "viewer"
        }).json()
        uid = created["id"]

        # Update role to editor (role passed as query param)
        r = session.put(f"{API}/auth/users/{uid}/role", params={"role": "editor"}, headers=auth_headers)
        assert r.status_code == 200

        # Verify via list
        users = session.get(f"{API}/auth/users", headers=auth_headers).json()
        target = next((u for u in users if u["id"] == uid), None)
        assert target and target["role"] == "editor"
        assert "upload" in target["permissions"]

        # Delete
        r = session.delete(f"{API}/auth/users/{uid}", headers=auth_headers)
        assert r.status_code == 200

        # Verify removal
        users_after = session.get(f"{API}/auth/users", headers=auth_headers).json()
        assert not any(u["id"] == uid for u in users_after)

    def test_update_role_viewer_forbidden(self, session, viewer_user):
        r = session.put(f"{API}/auth/users/some-id/role", params={"role": "admin"}, headers=viewer_user["headers"])
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# Articles CRUD + uploads + analytics
# ---------------------------------------------------------------------------
class TestArticles:
    @pytest.fixture(scope="class")
    def article_id(self, session):
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
        aid = body["id"]
        yield aid
        session.delete(f"{API}/articles/{aid}")

    def test_list_articles(self, session, article_id):
        r = session.get(f"{API}/articles")
        assert r.status_code == 200
        data = r.json()
        _assert_no_objectid(data)
        assert any(a["id"] == article_id for a in data)

    def test_get_article_increments_views(self, session, article_id):
        r1 = session.get(f"{API}/articles/{article_id}")
        assert r1.status_code == 200
        v1 = r1.json()["views"]
        _assert_no_objectid(r1.json())
        r2 = session.get(f"{API}/articles/{article_id}")
        assert r2.json()["views"] == v1 + 1

    def test_update_article_partial(self, session, article_id):
        r = session.put(f"{API}/articles/{article_id}", json={"title": "TEST Updated"})
        assert r.status_code == 200
        assert r.json()["title"] == "TEST Updated"
        # Verify persisted
        r2 = session.get(f"{API}/articles/{article_id}")
        assert r2.json()["title"] == "TEST Updated"

    def test_click_and_analytics(self, session, article_id):
        r = session.post(f"{API}/articles/{article_id}/click")
        assert r.status_code == 200
        analytics = session.get(f"{API}/articles/{article_id}/analytics")
        assert analytics.status_code == 200
        data = analytics.json()
        assert data["article_id"] == article_id
        assert data["total_clicks"] >= 1

    def test_standalone_image_upload(self, session):
        files = {"file": ("test.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")}
        r = requests.post(f"{API}/articles/upload-image", files=files)
        assert r.status_code == 200
        url = r.json()["image_url"]
        assert url.startswith("/api/uploads/articles/")
        # Fetch the served file
        served = requests.get(f"{BASE_URL}{url}")
        assert served.status_code == 200
        assert len(served.content) > 0

    def test_article_image_upload_attaches(self, session, article_id):
        files = {"file": ("a.jpg", io.BytesIO(b"fakejpeg"), "image/jpeg")}
        r = requests.post(f"{API}/articles/{article_id}/upload-image", files=files)
        assert r.status_code == 200
        url = r.json()["image_url"]
        assert url.startswith("/api/uploads/articles/")
        article = session.get(f"{API}/articles/{article_id}").json()
        assert article["image_url"] == url

    def test_delete_cascades_comments(self, session):
        # Create dedicated article
        a = session.post(f"{API}/articles", json={
            "category": "X", "title": "TEST Cascade", "description": "d",
            "content": "c", "author": "A", "comments_enabled": True
        }).json()
        aid = a["id"]
        c = session.post(f"{API}/comments", json={
            "article_id": aid, "author_name": "Parent", "content": "hi"
        })
        assert c.status_code == 200
        # Delete article
        d = session.delete(f"{API}/articles/{aid}")
        assert d.status_code == 200
        # Comments should 404 now because article gone
        r = session.get(f"{API}/comments/{aid}")
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Comments
# ---------------------------------------------------------------------------
class TestComments:
    @pytest.fixture(scope="class")
    def article_enabled(self, session):
        a = session.post(f"{API}/articles", json={
            "category": "C", "title": "TEST Comments On", "description": "d",
            "content": "c", "author": "A", "comments_enabled": True
        }).json()
        yield a["id"]
        session.delete(f"{API}/articles/{a['id']}")

    @pytest.fixture(scope="class")
    def article_disabled(self, session):
        a = session.post(f"{API}/articles", json={
            "category": "C", "title": "TEST Comments Off", "description": "d",
            "content": "c", "author": "A", "comments_enabled": False
        }).json()
        yield a["id"]
        session.delete(f"{API}/articles/{a['id']}")

    def test_create_comment_pending(self, session, article_enabled):
        r = session.post(f"{API}/comments", json={
            "article_id": article_enabled, "author_name": "P1", "content": "nice"
        })
        assert r.status_code == 200
        body = r.json()
        _assert_no_objectid(body)
        assert body["approved"] is False

    def test_list_approved_only_default(self, session, article_enabled):
        r = session.get(f"{API}/comments/{article_enabled}")
        assert r.status_code == 200
        for c in r.json():
            assert c["approved"] is True

    def test_list_all_with_flag(self, session, article_enabled):
        r = session.get(f"{API}/comments/{article_enabled}", params={"approved_only": "false"})
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_approve_and_delete(self, session, article_enabled):
        c = session.post(f"{API}/comments", json={
            "article_id": article_enabled, "author_name": "P2", "content": "approve me"
        }).json()
        cid = c["id"]
        r = session.put(f"{API}/comments/{cid}/approve")
        assert r.status_code == 200
        approved_list = session.get(f"{API}/comments/{article_enabled}").json()
        assert any(x["id"] == cid for x in approved_list)

        r = session.delete(f"{API}/comments/{cid}")
        assert r.status_code == 200

    def test_pending_all(self, session):
        r = session.get(f"{API}/comments/pending/all")
        assert r.status_code == 200
        data = r.json()
        _assert_no_objectid(data)
        for c in data:
            assert c["approved"] is False

    def test_comment_disabled_returns_403(self, session, article_disabled):
        r = session.post(f"{API}/comments", json={
            "article_id": article_disabled, "author_name": "X", "content": "blocked"
        })
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# Sponsors
# ---------------------------------------------------------------------------
class TestSponsors:
    def test_sponsor_crud(self, session):
        c = session.post(f"{API}/sponsors", json={
            "name": "TEST Sponsor", "tier": "gold", "website_url": "https://ex.com"
        })
        assert c.status_code == 200
        sid = c.json()["id"]
        assert c.json()["is_active"] is True

        # List active
        active = session.get(f"{API}/sponsors").json()
        _assert_no_objectid(active)
        assert any(s["id"] == sid for s in active)

        # Update
        u = session.put(f"{API}/sponsors/{sid}", json={"name": "TEST Sponsor Renamed", "tier": "platinum"})
        assert u.status_code == 200
        assert u.json()["name"] == "TEST Sponsor Renamed"
        assert u.json()["tier"] == "platinum"

        # Logo upload
        files = {"file": ("logo.png", io.BytesIO(b"png"), "image/png")}
        lu = requests.post(f"{API}/sponsors/{sid}/upload-logo", files=files)
        assert lu.status_code == 200
        assert lu.json()["logo_url"].startswith("/api/uploads/sponsors/")

        # Deactivate via update and check active_only filter
        session.put(f"{API}/sponsors/{sid}", json={"is_active": False})
        active2 = session.get(f"{API}/sponsors").json()
        assert not any(s["id"] == sid for s in active2)
        all_list = session.get(f"{API}/sponsors", params={"active_only": "false"}).json()
        assert any(s["id"] == sid for s in all_list)

        # Delete
        d = session.delete(f"{API}/sponsors/{sid}")
        assert d.status_code == 200


# ---------------------------------------------------------------------------
# Art submissions
# ---------------------------------------------------------------------------
class TestArt:
    def test_art_flow(self, session):
        c = session.post(f"{API}/art", json={
            "title": "TEST Art", "artist_name": "Kiddo", "grade": "3rd", "description": "drawing"
        })
        assert c.status_code == 200
        aid = c.json()["id"]
        assert c.json()["approved"] is False

        # Not in approved list yet
        assert not any(a["id"] == aid for a in session.get(f"{API}/art").json())
        # Pending list includes
        assert any(a["id"] == aid for a in session.get(f"{API}/art/pending").json())

        # Upload image
        files = {"file": ("p.png", io.BytesIO(b"png"), "image/png")}
        u = requests.post(f"{API}/art/{aid}/upload-image", files=files)
        assert u.status_code == 200
        assert u.json()["image_url"].startswith("/api/uploads/art/")

        # Approve
        session.put(f"{API}/art/{aid}/approve")
        approved = session.get(f"{API}/art").json()
        _assert_no_objectid(approved)
        assert any(a["id"] == aid for a in approved)

        # Feature toggle
        f1 = session.put(f"{API}/art/{aid}/feature").json()
        assert f1["featured"] is True
        f2 = session.put(f"{API}/art/{aid}/feature").json()
        assert f2["featured"] is False

        # Delete
        d = session.delete(f"{API}/art/{aid}")
        assert d.status_code == 200


# ---------------------------------------------------------------------------
# Popups
# ---------------------------------------------------------------------------
class TestPopups:
    def test_popup_flow(self, session):
        c = session.post(f"{API}/popups", json={
            "title": "TEST Popup", "message": "hi", "type": "announcement"
        })
        assert c.status_code == 200
        pid = c.json()["id"]

        # GET active
        active = session.get(f"{API}/popups").json()
        _assert_no_objectid(active)
        assert any(p["id"] == pid for p in active)

        # GET all
        all_p = session.get(f"{API}/popups/all").json()
        assert any(p["id"] == pid for p in all_p)

        # Update
        u = session.put(f"{API}/popups/{pid}", json={"title": "TEST Popup Updated"})
        assert u.status_code == 200
        assert u.json()["title"] == "TEST Popup Updated"

        # Deactivate
        d = session.put(f"{API}/popups/{pid}/deactivate")
        assert d.status_code == 200
        active2 = session.get(f"{API}/popups").json()
        assert not any(p["id"] == pid for p in active2)

        # Delete
        session.delete(f"{API}/popups/{pid}")


# ---------------------------------------------------------------------------
# Mural (Givebacks tiered pricing)
# ---------------------------------------------------------------------------
class TestMural:
    def test_pricing_config(self, session):
        r = session.get(f"{API}/mural/config/pricing")
        assert r.status_code == 200
        data = r.json()
        assert data["tiers"] == {"plain": 3, "featured": 5}
        assert "givebacks" in data["givebacks_url"]

    def test_mural_flow_plain_and_featured(self, session):
        # Plain tier
        p = session.post(f"{API}/mural", json={
            "message": "TEST plain msg", "author_name": "Parent A", "tier": "plain"
        })
        assert p.status_code == 200
        plain_id = p.json()["id"]
        assert p.json()["tier"] == "plain"
        assert p.json()["price"] == 3
        assert p.json()["paid"] is False and p.json()["approved"] is False

        # Featured tier
        f = session.post(f"{API}/mural", json={
            "message": "TEST featured msg", "author_name": "Parent B", "tier": "featured"
        })
        assert f.status_code == 200
        feat_id = f.json()["id"]
        assert f.json()["tier"] == "featured"
        assert f.json()["price"] == 5

        # Not in public view
        public = session.get(f"{API}/mural").json()
        _assert_no_objectid(public)
        assert not any(m["id"] == plain_id for m in public)

        # Pending includes both
        pending = session.get(f"{API}/mural/pending").json()
        ids = [m["id"] for m in pending]
        assert plain_id in ids and feat_id in ids

        # Approve plain
        ap = session.put(f"{API}/mural/{plain_id}/approve")
        assert ap.status_code == 200
        assert ap.json()["paid"] is True and ap.json()["approved"] is True

        # Now visible publicly
        public2 = session.get(f"{API}/mural").json()
        assert any(m["id"] == plain_id for m in public2)

        # Reject featured
        rj = session.put(f"{API}/mural/{feat_id}/reject")
        assert rj.status_code == 200

        # Delete both
        assert session.delete(f"{API}/mural/{plain_id}").status_code == 200
        assert session.delete(f"{API}/mural/{feat_id}").status_code == 200

    def test_mural_invalid_tier_defaults_to_plain(self, session):
        r = session.post(f"{API}/mural", json={
            "message": "TEST bad tier", "author_name": "X", "tier": "premium"
        })
        assert r.status_code == 200
        assert r.json()["tier"] == "plain"
        assert r.json()["price"] == 3
        session.delete(f"{API}/mural/{r.json()['id']}")


# ---------------------------------------------------------------------------
# Uploads serving
# ---------------------------------------------------------------------------
class TestUploads:
    def test_upload_and_fetch(self, session):
        files = {"file": ("probe.png", io.BytesIO(b"\x89PNGprobe"), "image/png")}
        r = requests.post(f"{API}/articles/upload-image", files=files)
        assert r.status_code == 200
        url = r.json()["image_url"]
        served = requests.get(f"{BASE_URL}{url}")
        assert served.status_code == 200
        assert b"probe" in served.content

    def test_upload_nonexistent(self, session):
        r = requests.get(f"{API}/uploads/articles/does-not-exist.png")
        assert r.status_code == 404
