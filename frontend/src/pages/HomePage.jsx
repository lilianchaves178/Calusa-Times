import React from 'react';
import AnnouncementTicker from '../components/AnnouncementTicker';
import Header from '../components/Header';
import NewspaperHeader from '../components/NewspaperHeader';
import ArticleCard from '../components/ArticleCard';
import StudentSpotlight from '../components/StudentSpotlight';
import AchievementsSection from '../components/AchievementsSection';
import Footer from '../components/Footer';
import { articles } from '../mockData';
import { Newspaper } from 'lucide-react';

const HomePage = () => {
  const featuredArticle = articles.find(a => a.featured);
  const latestArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <AnnouncementTicker />
      <Header />
      <NewspaperHeader />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Newspaper-style section header */}
        <div className="border-t-4 border-b-4 border-[#0f1e42] py-2 mb-6">
          <div className="border-t border-b border-[#0f1e42] py-2">
            <h2 className="text-center text-2xl font-black text-[#0f1e42] uppercase tracking-wider" style={{fontFamily: 'Georgia, serif'}}>
              Today's Edition
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {featuredArticle && (
              <div className="mb-6">
                <ArticleCard article={featuredArticle} featured={true} />
              </div>
            )}

            {/* Section divider */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex-1 h-px bg-[#0f1e42]"></div>
              <div className="flex items-center gap-2">
                <Newspaper size={20} className="text-[#0f1e42]" />
                <h2 className="text-xl font-black text-[#0f1e42] uppercase tracking-wide" style={{fontFamily: 'Georgia, serif'}}>
                  Latest Stories
                </h2>
              </div>
              <div className="flex-1 h-px bg-[#0f1e42]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <StudentSpotlight />
            <AchievementsSection />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
