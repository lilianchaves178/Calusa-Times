import React from 'react';
import AnnouncementTicker from '../components/AnnouncementTicker';
import Header from '../components/Header';
import NewspaperHeader from '../components/NewspaperHeader';
import ArticleCard from '../components/ArticleCard';
import StudentSpotlight from '../components/StudentSpotlight';
import AchievementsSection from '../components/AchievementsSection';
import Footer from '../components/Footer';
import { articles } from '../mockData';
import { Newspaper, Sparkles } from 'lucide-react';

const HomePage = () => {
  const featuredArticle = articles.find(a => a.featured);
  const latestArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementTicker />
      <Header />
      <NewspaperHeader />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Section Headers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Featured Story</h2>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-8"></div>
          </div>
        </div>

        {/* Featured Story + Student Spotlight Row - Cards Aligned */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            {featuredArticle && <ArticleCard article={featuredArticle} featured={true} />}
          </div>
          <div className="lg:col-span-1">
            <StudentSpotlight />
          </div>
        </div>

        {/* Section Headers Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Newspaper className="text-blue-700" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Latest Stories</h2>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-8"></div>
          </div>
        </div>

        {/* Latest Stories + Recent Achievements Row - Cards Aligned */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <AchievementsSection />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;