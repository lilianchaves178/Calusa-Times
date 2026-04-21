import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import SpotlightPage from "./pages/SpotlightPage";
import AchievementsPage from "./pages/AchievementsPage";
import SchoolInfoPage from "./pages/SchoolInfoPage";
import SubmitStoryPage from "./pages/SubmitStoryPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticlesPage from "./pages/AdminArticlesPage";
import AdminArticleEditPage from "./pages/AdminArticleEditPage";
import AdminCommentsPage from "./pages/AdminCommentsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserCreatePage from "./pages/AdminUserCreatePage";
import AdminArtPage from "./pages/AdminArtPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminSponsorsPage from "./pages/AdminSponsorsPage";
import AdminSponsorEditPage from "./pages/AdminSponsorEditPage";
import AdminMuralPage from "./pages/AdminMuralPage";
import AdminPopupsPage from "./pages/AdminPopupsPage";
import AdminPopupEditPage from "./pages/AdminPopupEditPage";
import StudentArtPage from "./pages/StudentArtPage";
import SubmitArtPage from "./pages/SubmitArtPage";
import SponsorsPage from "./pages/SponsorsPage";
import MuralPage from "./pages/MuralPage";
import PostMessagePage from "./pages/PostMessagePage";
import PopupAnnouncement from "./components/PopupAnnouncement";
import RequireAuth from "./components/RequireAuth";
import { Toaster } from "./components/ui/toaster";

function Protected({ children, permission }) {
  return <RequireAuth requiredPermission={permission}>{children}</RequireAuth>;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <PopupAnnouncement />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/spotlight" element={<SpotlightPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/school-info" element={<SchoolInfoPage />} />
          <Route path="/submit-story" element={<SubmitStoryPage />} />
          <Route path="/student-art" element={<StudentArtPage />} />
          <Route path="/submit-art" element={<SubmitArtPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/mural" element={<MuralPage />} />
          <Route path="/post-message" element={<PostMessagePage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<Protected><AdminDashboard /></Protected>} />

          <Route path="/admin/articles" element={<Protected><AdminArticlesPage /></Protected>} />
          <Route path="/admin/articles/new" element={<Protected permission="upload"><AdminArticleEditPage /></Protected>} />
          <Route path="/admin/articles/:id/edit" element={<Protected permission="edit"><AdminArticleEditPage /></Protected>} />

          <Route path="/admin/comments" element={<Protected><AdminCommentsPage /></Protected>} />

          <Route path="/admin/users" element={<Protected permission="manage_users"><AdminUsersPage /></Protected>} />
          <Route path="/admin/users/new" element={<Protected permission="manage_users"><AdminUserCreatePage /></Protected>} />

          <Route path="/admin/art" element={<Protected><AdminArtPage /></Protected>} />

          <Route path="/admin/sponsors" element={<Protected><AdminSponsorsPage /></Protected>} />
          <Route path="/admin/sponsors/new" element={<Protected permission="edit"><AdminSponsorEditPage /></Protected>} />
          <Route path="/admin/sponsors/:id/edit" element={<Protected permission="edit"><AdminSponsorEditPage /></Protected>} />

          <Route path="/admin/mural" element={<Protected><AdminMuralPage /></Protected>} />

          <Route path="/admin/popups" element={<Protected><AdminPopupsPage /></Protected>} />
          <Route path="/admin/popups/new" element={<Protected permission="edit"><AdminPopupEditPage /></Protected>} />
          <Route path="/admin/popups/:id/edit" element={<Protected permission="edit"><AdminPopupEditPage /></Protected>} />

          <Route path="/admin/analytics" element={<Protected><AdminAnalyticsPage /></Protected>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
