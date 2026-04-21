import React from 'react';
import { Link } from 'react-router-dom';

const categoryColors = {
  news: 'bg-blue-500 text-white',
  arts: 'bg-purple-500 text-white',
  opinion: 'bg-orange-500 text-white',
  sports: 'bg-green-500 text-white',
  poetry: 'bg-pink-500 text-white',
  science: 'bg-yellow-500 text-blue-900',
  'quick thought': 'bg-teal-500 text-white'
};

const ArticleCard = ({ article, featured = false }) => {
  return (
    <Link to={`/articles/${article.id}`} className="block h-full">
      <div className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full flex flex-col ${
        featured ? 'ring-4 ring-yellow-400' : ''
      }`}>
        {article.image && (
          <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={article.image}
              alt={article.title}
              className="max-w-full max-h-full w-auto h-auto object-contain transition-transform hover:scale-105"
              loading="lazy"
            />
            {featured && (
              <div className="absolute top-3 left-3">
                <span className="inline-block bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ⭐ Featured Story
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-3">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
              categoryColors[article.category] || 'bg-gray-500 text-white'
            }`}>
              {article.category}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{article.title}</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-1">{article.description}</p>
          
          <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
            <div className="text-gray-700">
              <span className="font-semibold">{article.author}</span>
              {article.grade && <span className="text-gray-500"> • {article.grade}</span>}
            </div>
            <span className="text-gray-500">{article.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;