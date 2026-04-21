import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Info, MapPin, Phone, Mail, Globe, Clock, Star, Instagram,
  Users, MessagesSquare, FileText, HeartHandshake, ArrowRight, BookOpen,
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

const SchoolInfoPage = () => {
  const [info, setInfo] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    api
      .get('/school-info')
      .then((res) => setInfo(res.data))
      .catch(() => setInfo(null));
    api
      .get('/parent-resource-pages')
      .then((res) => setPages(res.data || []))
      .catch(() => setPages([]));
  }, []);

  if (!info) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12 text-gray-500">Loading…</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Info size={32} className="text-[#0f1e42]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">About {info.school_name}</h1>
          </div>
          {info.tagline && (
            <p className="text-yellow-600 font-semibold italic">{info.tagline}</p>
          )}
        </div>

        {/* Hero image — cropped via object-cover + capped height so it never dominates */}
        {info.image_url && (
          <div
            className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg mb-10"
            data-testid="school-info-image"
          >
            <img
              src={assetUrl(info.image_url)}
              alt={info.school_name}
              className="w-full h-56 md:h-72 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e42]/70 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <h2 className="text-2xl md:text-3xl font-black leading-tight">{info.school_name}</h2>
              {info.tagline && <p className="text-yellow-300 font-semibold">{info.tagline}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-[#0f1e42] mb-4">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {(info.about_paragraphs || []).map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {info.notable_achievements && info.notable_achievements.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <h2 className="text-2xl font-bold text-[#0f1e42] mb-4">Notable Highlights</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {info.notable_achievements.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                    >
                      <Star
                        size={18}
                        className="text-yellow-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                      />
                      <span className="text-gray-800 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contact sidebar */}
          <div className="space-y-4">
            <div className="bg-[#0f1e42] text-white rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <div className="space-y-4 text-sm">
                {info.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line">{info.address}</span>
                  </div>
                )}
                {info.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-yellow-300 flex-shrink-0" />
                    <a href={`tel:${info.phone}`} className="hover:text-yellow-300">{info.phone}</a>
                  </div>
                )}
                {info.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-yellow-300 flex-shrink-0" />
                    <a href={`mailto:${info.email}`} className="hover:text-yellow-300 break-all">
                      {info.email}
                    </a>
                  </div>
                )}
                {info.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-yellow-300 flex-shrink-0" />
                    <a
                      href={info.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-yellow-300 break-all"
                    >
                      {info.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {info.hours && (
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line">{info.hours}</span>
                  </div>
                )}
                {info.instagram_url && (
                  <a
                    href={info.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-white bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:scale-105 transition-transform shadow"
                  >
                    <Instagram size={16} />
                    @calusaelemschool
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Parent Resources */}
        {pages.length > 0 && (
          <section className="mt-12" data-testid="parent-resources-section">
            <div className="flex items-center gap-3 mb-4">
              <Users size={28} className="text-[#0f1e42]" />
              <h2 className="text-3xl font-black text-[#0f1e42]">Parent Resources</h2>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl">
              Your one-stop hub for everything Calusa families need. Tap a card below to read the full guide.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SchoolInfoPage;
