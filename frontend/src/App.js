import { useEffect } from "react";
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
import AdminCommentsPage from "./pages/AdminCommentsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminArtPage from "./pages/AdminArtPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import StudentArtPage from "./pages/StudentArtPage";
import SubmitArtPage from "./pages/SubmitArtPage";
import SponsorsPage from "./pages/SponsorsPage";
import MuralPage from "./pages/MuralPage";
import PostMessagePage from "./pages/PostMessagePage";
import PopupAnnouncement from "./components/PopupAnnouncement";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <PopupAnnouncement />
        <Routes>
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
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/articles" element={<AdminArticlesPage />} />
          <Route path="/admin/comments" element={<AdminCommentsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/art" element={<AdminArtPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
