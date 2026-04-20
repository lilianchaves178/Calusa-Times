import React from 'react';
import AnnouncementTicker from '../components/AnnouncementTicker';
import Header from '../components/Header';
import NewspaperHeader from '../components/NewspaperHeader';
import ArticleCard from '../components/ArticleCard';
import StudentSpotlight from '../components/StudentSpotlight';
import AchievementsSection from '../components/AchievementsSection';
import Footer from '../components/Footer';
import { articles } from '../mockData';
import { ArrowRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const featuredArticle = articles.find(a => a.featured);
  const latestArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <AnnouncementTicker />
      <Header />
      <NewspaperHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {featuredArticle && (
              <div className="mb-8">
                <ArticleCard article={featuredArticle} featured={true} />
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper size={24} className="text-[#0f1e42]" />
                <h2 className="text-3xl font-black text-[#0f1e42]">Latest Stories</h2>
              </div>
              <Link to="/articles" className="flex items-center gap-2 text-[#0f1e42] font-semibold hover:gap-3 transition-all">
                View All
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
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
