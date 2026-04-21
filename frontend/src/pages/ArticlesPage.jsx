import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleCard from '../components/ArticleCard';
import { Newspaper } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/articles')
      .then((res) =>
        setArticles(
          res.data.map((a) => ({
            ...a,
            image: assetUrl(a.image_url),
            date: new Date(a.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          })),
        ),
      )
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper size={32} className="text-[#0f1e42]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">All Articles</h1>
          </div>
          <p className="text-gray-600">Stories written by our talented Calusa students</p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-500" data-testid="no-articles-msg">
            No stories published yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ArticlesPage;
