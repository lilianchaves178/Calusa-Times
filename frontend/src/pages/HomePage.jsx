import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import NewspaperHeader from '../components/NewspaperHeader';
import ArticleCard from '../components/ArticleCard';
import StudentSpotlight from '../components/StudentSpotlight';
import AchievementsSection from '../components/AchievementsSection';
import PhotoOfTheWeek from '../components/PhotoOfTheWeek';
import Footer from '../components/Footer';
import { Newspaper, Sparkles } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const mapArticle = (a) => ({
  ...a,
  image: assetUrl(a.image_url),
  date: new Date(a.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
});

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/articles')
      .then((res) => setArticles(res.data.map(mapArticle)))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const featuredArticle = articles.find((a) => a.featured);
  const latestArticles = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NewspaperHeader />

      <div className="max-w-7xl mx-auto px-6 py-10">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 items-stretch">
          <div className="lg:col-span-2 flex">
            {featuredArticle ? (
              <div className="flex-1">
                <ArticleCard article={featuredArticle} featured={true} />
              </div>
            ) : (
              <div className="flex-1 bg-white border-4 border-gray-200 rounded-2xl p-12 flex items-center justify-center text-gray-400">
                {loading ? 'Loading…' : 'No featured story yet'}
              </div>
            )}
          </div>
          <div className="lg:col-span-1 flex">
            <StudentSpotlight />
          </div>
        </div>

        <PhotoOfTheWeek />

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {latestArticles.length === 0 && !loading ? (
              <p className="text-gray-500">No stories published yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
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
