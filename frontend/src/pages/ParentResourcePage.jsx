import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Users, MessagesSquare, FileText, HeartHandshake, BookOpen, Info, ArrowLeft,
} from 'lucide-react';
import api, { assetUrl } from '../lib/api';
import { renderBody } from '../lib/parentResourceMarkdown';

const CATEGORY_META = {
  PTA: { Icon: HeartHandshake, tint: 'from-pink-500 to-rose-500', chip: 'bg-pink-100 text-pink-800' },
  INFO: { Icon: BookOpen, tint: 'from-blue-500 to-indigo-500', chip: 'bg-blue-100 text-blue-800' },
  CHAT: { Icon: MessagesSquare, tint: 'from-emerald-500 to-teal-500', chip: 'bg-emerald-100 text-emerald-800' },
  FORMS: { Icon: FileText, tint: 'from-amber-500 to-orange-500', chip: 'bg-amber-100 text-amber-800' },
  VOLUNTEER: { Icon: Users, tint: 'from-violet-500 to-purple-500', chip: 'bg-violet-100 text-violet-800' },
  OTHER: { Icon: Info, tint: 'from-slate-500 to-slate-700', chip: 'bg-slate-100 text-slate-800' },
};

const ParentResourcePage = () => {
  const { category: rawCategory } = useParams();
  const category = (rawCategory || '').toUpperCase();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const meta = CATEGORY_META[category] || CATEGORY_META.OTHER;
  const HeroIcon = meta.Icon;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/parent-resource-pages/${category}`)
      .then((res) => { if (!cancelled) setPage(res.data); })
      .catch(() => { if (!cancelled) setPage(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          to="/pta-corner"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0f1e42] mb-6"
          data-testid="back-to-info-btn"
        >
          <ArrowLeft size={14} /> Back to Parent Corner
        </Link>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : !page ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
            This resource page isn't available yet.
          </div>
        ) : (
          <article className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid={`resource-page-${category}`}>
            {page.hero_image_url ? (
              <div className="w-full bg-[#0f1e42] overflow-hidden">
                <img
                  src={assetUrl(page.hero_image_url)}
                  alt={page.title}
                  className="w-full h-auto max-h-[420px] object-contain mx-auto"
                />
              </div>
            ) : (
              <div className={`w-full aspect-[16/5] bg-gradient-to-br ${meta.tint} flex items-center justify-center`}>
                <HeroIcon size={80} className="text-white opacity-90" />
              </div>
            )}

            <div className="p-8 md:p-10">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-3 ${meta.chip}`}>
                <HeroIcon size={11} />
                {category}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-[#0f1e42] leading-tight mb-2">
                {page.title}
              </h1>
              {page.subtitle && (
                <p className="text-lg text-gray-600 italic mb-4">{page.subtitle}</p>
              )}
              <div className="mt-6 max-w-none" data-testid="resource-body">
                {page.body ? renderBody(page.body) : (
                  <p className="text-gray-500 italic">
                    An editor is still putting this page together — check back soon!
                  </p>
                )}
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ParentResourcePage;
