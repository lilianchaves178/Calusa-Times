import React from 'react';
import { Link } from 'react-router-dom';

const categoryColors = {
  news: 'bg-gray-900 text-white',
  arts: 'bg-purple-900 text-white',
  opinion: 'bg-red-900 text-white',
  sports: 'bg-green-900 text-white',
  poetry: 'bg-pink-900 text-white',
  science: 'bg-blue-900 text-white',
  'quick thought': 'bg-amber-900 text-white'
};

const ArticleCard = ({ article, featured = false }) => {
  return (
    <Link to={`/articles/${article.id}`}>
      <div className={`bg-white border-2 border-[#0f1e42] transition-all hover:shadow-md ${
        featured ? 'shadow-md' : ''
      }`}>
        {article.image && (
          <div className="relative h-48 overflow-hidden border-b-2 border-[#0f1e42]">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
            />
            {featured && (
              <div className="absolute top-0 left-0 right-0 bg-[#0f1e42] text-white py-1 px-3 text-center">
                <span className="text-xs font-bold uppercase tracking-widest" style={{fontFamily: 'Georgia, serif'}}>
                  Featured Story
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-4">
          <div className="mb-2">
            <span className={`inline-block text-[10px] font-bold px-2 py-1 uppercase tracking-widest ${
              categoryColors[article.category] || 'bg-gray-900 text-white'
            }`} style={{fontFamily: 'Georgia, serif'}}>
              {article.category}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#0f1e42] mb-2 leading-tight border-b border-gray-300 pb-2" style={{fontFamily: 'Georgia, serif'}}>
            {article.title}
          </h3>
          <p className="text-gray-700 text-sm mb-3 leading-relaxed" style={{fontFamily: 'Georgia, serif'}}>
            {article.description}
          </p>
          
          <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-2">
            <div className="text-gray-700" style={{fontFamily: 'Georgia, serif'}}>
              <span className="font-bold">By {article.author}</span>
              {article.grade && <span className="text-gray-500"> | {article.grade}</span>}
            </div>
            <span className="text-gray-500 italic" style={{fontFamily: 'Georgia, serif'}}>{article.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
