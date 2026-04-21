"""Iteration 6: Pexels free-image search + import endpoints + image_url fields on art/spotlight."""
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path("/app/frontend/.env"))

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@calusaschool.org"
ADMIN_PASSWORD = "Calusa2024!"


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


class TestPexelsSearch:
    def test_search_returns_photos(self):
        r = requests.get(f"{API}/pexels/search", params={"q": "school", "per_page": 6})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "photos" in body
        assert isinstance(body["photos"], list)
        assert len(body["photos"]) > 0
        first = body["photos"][0]
        # Required shape per spec
        for k in ("id", "thumb", "full", "photographer"):
            assert k in first, f"missing {k} in {first}"
        assert isinstance(first["id"], int)
        assert first["thumb"].startswith("https://")
        assert first["full"].startswith("https://")

    def test_search_missing_q_400_or_422(self):
        r = requests.get(f"{API}/pexels/search")
        assert r.status_code in (400, 422)


class TestPexelsImport:
    @pytest.fixture(scope="class")
    def sample_https_url(self):
        # Pull a real Pexels URL via the search endpoint so the import test mirrors prod usage
        r = requests.get(f"{API}/pexels/search", params={"q": "classroom", "per_page": 3})
        assert r.status_code == 200
        photos = r.json()["photos"]
        assert photos, "no photos returned"
        return photos[0]["full"]

    def test_import_success_articles(self, sample_https_url):
        r = requests.post(f"{API}/pexels/import", json={"url": sample_https_url, "target": "articles"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "image_url" in body
        url = body["image_url"]
        assert url.startswith("/api/uploads/articles/")
        # File must actually exist on disk
        local = Path("/app") / url.lstrip("/").replace("api/uploads/", "uploads/")
        assert local.exists(), f"missing file {local}"
        assert local.stat().st_size > 0
        # And it must be served
        served = requests.get(f"{BASE_URL}{url}")
        assert served.status_code == 200
        assert len(served.content) > 0

    @pytest.mark.parametrize("target", ["spotlight", "school", "art", "sponsors"])
    def test_import_success_all_targets(self, sample_https_url, target):
        r = requests.post(f"{API}/pexels/import", json={"url": sample_https_url, "target": target})
        assert r.status_code == 200, r.text
        url = r.json()["image_url"]
        assert url.startswith(f"/api/uploads/{target}/")

    def test_import_rejects_non_https(self):
        r = requests.post(f"{API}/pexels/import",
                          json={"url": "http://images.pexels.com/foo.jpg", "target": "articles"})
        assert r.status_code == 400

    def test_import_rejects_invalid_target(self, sample_https_url):
        r = requests.post(f"{API}/pexels/import", json={"url": sample_https_url, "target": "evil"})
        assert r.status_code == 400


class TestArtAcceptsImageUrl:
    def test_create_art_with_image_url_persists(self, admin_headers):
        img = "/api/uploads/art/seed-test.jpg"
        r = requests.post(f"{API}/art", json={
            "title": f"TEST_PexArt_{uuid.uuid4().hex[:6]}",
            "artist_name": "Tester",
            "grade": "4th",
            "description": "from pexels",
            "image_url": img,
        })
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["image_url"] == img, body
        aid = body["id"]
        # Approve and verify it surfaces in public list with same URL
        ap = requests.put(f"{API}/art/{aid}/approve", headers=admin_headers)
        assert ap.status_code == 200
        public = requests.get(f"{API}/art").json()
        match = next((a for a in public if a["id"] == aid), None)
        assert match is not None
        assert match["image_url"] == img
        requests.delete(f"{API}/art/{aid}", headers=admin_headers)

    def test_create_art_without_image_url_still_works(self, admin_headers):
        r = requests.post(f"{API}/art", json={
            "title": f"TEST_PexArtNoImg_{uuid.uuid4().hex[:6]}",
            "artist_name": "Tester",
            "grade": "4th",
        })
        assert r.status_code == 200
        # default empty string
        assert r.json()["image_url"] == ""
        requests.delete(f"{API}/art/{r.json()['id']}", headers=admin_headers)


class TestSpotlightAcceptsImageUrl:
    def test_submit_spotlight_with_image_url_persists(self, admin_headers):
        img = "/api/uploads/spotlight/seed-test.jpg"
        r = requests.post(f"{API}/spotlight/submit", json={
            "name": f"TEST_PexSpot_{uuid.uuid4().hex[:6]}",
            "grade": "5th",
            "quote": "Pexels test quote",
            "image_url": img,
        })
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["image_url"] == img
        assert body["approved"] is False
        sid = body["id"]
        # Verify it's in pending list with the image
        pending = requests.get(f"{API}/spotlight/pending", headers=admin_headers).json()
        match = next((s for s in pending if s["id"] == sid), None)
        assert match is not None
        assert match["image_url"] == img
        # Cleanup
        requests.delete(f"{API}/spotlight/{sid}", headers=admin_headers)
