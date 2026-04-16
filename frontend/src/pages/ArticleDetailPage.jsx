import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { articles } from '../mockData';
import { Calendar, Edit, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FFF8E7]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-[#0f1e42] mb-4">Article Not Found</h1>
          <Link to="/" className="text-[#0f1e42] font-semibold hover:underline">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="flex items-center gap-2 text-[#0f1e42] font-semibold mb-6 hover:gap-3 transition-all">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <article className="bg-white rounded-2xl border-4 border-[#0f1e42] p-8 shadow-lg">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl font-black text-[#0f1e42] mb-6 leading-tight">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-2">
              <Edit size={16} />
              <span className="font-semibold">{article.author}</span>
              {article.grade && <span>· {article.grade}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{article.date}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              {article.description}
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
