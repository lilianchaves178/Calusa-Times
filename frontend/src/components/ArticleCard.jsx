import React from 'react';
import { Link } from 'react-router-dom';

const categoryColors = {
  news: 'bg-blue-100 text-blue-700',
  arts: 'bg-purple-100 text-purple-700',
  opinion: 'bg-red-100 text-red-700',
  sports: 'bg-green-100 text-green-700',
  poetry: 'bg-pink-100 text-pink-700',
  science: 'bg-yellow-100 text-yellow-700',
  'quick thought': 'bg-amber-100 text-amber-700'
};

const ArticleCard = ({ article, featured = false }) => {
  return (
    <Link to={`/articles/${article.id}`}>
      <div className={`bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:border-[#0f1e42] hover:-translate-y-1 ${
        featured ? 'border-[#FFD700] shadow-md' : ''
      }`}>
        {article.image && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
            {featured && (
              <div className="absolute top-3 left-3">
                <span className="inline-block bg-[#FFD700] text-[#0f1e42] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                  Article of the Week
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-3">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${
              categoryColors[article.category] || 'bg-gray-100 text-gray-700'
            }`}>
              {article.category}
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#0f1e42] mb-3 leading-tight">{article.title}</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{article.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-700">
              <span className="font-medium">{article.author}</span>
              {article.grade && <span className="text-gray-500"> · {article.grade}</span>}
            </div>
            <span className="text-gray-500">{article.date}</span>
          </div>

          {featured && (
            <button className="mt-4 bg-[#0f1e42] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a2d5a] transition-colors w-full">
              Read More
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
