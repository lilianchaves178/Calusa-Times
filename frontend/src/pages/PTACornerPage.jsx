import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  HeartHandshake, Info, MessagesSquare, FileText, Users, ArrowRight, BookOpen,
} from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const CATEGORY_META = {
  PTA: { Icon: HeartHandshake, tint: 'from-pink-500 to-rose-500', chip: 'bg-pink-100 text-pink-800' },
  INFO: { Icon: BookOpen, tint: 'from-blue-500 to-indigo-500', chip: 'bg-blue-100 text-blue-800' },
  CHAT: { Icon: MessagesSquare, tint: 'from-emerald-500 to-teal-500', chip: 'bg-emerald-100 text-emerald-800' },
  FORMS: { Icon: FileText, tint: 'from-amber-500 to-orange-500', chip: 'bg-amber-100 text-amber-800' },
  VOLUNTEER: { Icon: Users, tint: 'from-violet-500 to-purple-500', chip: 'bg-violet-100 text-violet-800' },
  OTHER: { Icon: Info, tint: 'from-slate-500 to-slate-700', chip: 'bg-slate-100 text-slate-800' },
};

const PTACornerPage = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/parent-resource-pages')
      .then((res) => setPages(res.data || []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-4">
          <HeartHandshake size={32} className="text-[#0f1e42]" />
          <h1 className="text-4xl font-black text-[#0f1e42]">PTA Corner</h1>
        </div>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Your one-stop hub for everything Calusa families need. Tap a card below to read the full guide.
        </p>

        {loading && <div className="text-gray-500">Loading…</div>}

        {!loading && pages.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-md text-gray-500" data-testid="pta-corner-empty">
            No resources have been published yet. Check back soon!
          </div>
        )}

        {pages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="pta-corner-section">
            {pages.map((p) => {
              const meta = CATEGORY_META[p.category] || CATEGORY_META.OTHER;
              const HeroIcon = meta.Icon;
              return (
                <Link
                  key={p.category}
                  to={`/parent-resources/${p.category.toLowerCase()}`}
                  className="group block bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                  data-testid={`parent-resource-${p.category}`}
                >
                  {/* Hero */}
                  {p.hero_image_url ? (
                    <div className="w-full aspect-[16/7] bg-gray-100 overflow-hidden">
                      <img
                        src={assetUrl(p.hero_image_url)}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className={`w-full aspect-[16/7] bg-gradient-to-br ${meta.tint} flex items-center justify-center`}>
                      <HeroIcon size={56} className="text-white opacity-90" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 ${meta.chip}`}>
                      <HeroIcon size={11} />
                      {p.category}
                    </span>
                    <h3 className="font-bold text-[#0f1e42] text-lg leading-tight mb-1">{p.title}</h3>
                    {p.subtitle && (
                      <p className="text-sm text-gray-600 leading-snug">{p.subtitle}</p>
                    )}
                    <p className="mt-3 inline-flex items-center gap-1 text-sm text-[#0f1e42] font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
                      Read more <ArrowRight size={14} />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PTACornerPage;
