import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleCard from '../components/ArticleCard';
import { articles } from '../mockData';
import { Newspaper } from 'lucide-react';

const ArticlesPage = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArticlesPage;
