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
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/spotlight" element={<SpotlightPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/school-info" element={<SchoolInfoPage />} />
          <Route path="/submit-story" element={<SubmitStoryPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
