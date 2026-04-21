import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Sparkles, Mail, Phone, ArrowRight } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/sponsors')
      .then((res) => setSponsors(res.data))
      .catch(() => setSponsors([]))
      .finally(() => setLoading(false));
  }, []);

  const tiers = {
    platinum: sponsors.filter((s) => s.tier === 'platinum'),
    gold: sponsors.filter((s) => s.tier === 'gold'),
    silver: sponsors.filter((s) => s.tier === 'silver'),
    bronze: sponsors.filter((s) => s.tier === 'bronze'),
  };

  const SponsorLink = ({ s, className, nameSize = 'text-base' }) => (
    <a
      href={s.website_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all flex items-center justify-center overflow-hidden ${className}`}
      data-testid={`sponsor-${s.id}`}
    >
      {/* Logo layer */}
      <div className="w-full h-full flex items-center justify-center p-4 transition-opacity duration-300 group-hover:opacity-0">
        {s.logo_url ? (
          <img
            src={assetUrl(s.logo_url)}
            alt={s.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className={`font-bold text-gray-700 ${nameSize}`}>{s.name}</span>
        )}
      </div>

      {/* Rollover description overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-900 to-blue-700 text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        data-testid={`sponsor-overlay-${s.id}`}
      >
        <h3 className={`font-black ${nameSize === 'text-base' ? 'text-lg' : nameSize} mb-2 text-center`}>
          {s.name}
        </h3>
        {s.description ? (
          <p className="text-sm text-blue-100 text-center leading-snug line-clamp-4 mb-3">
            {s.description}
          </p>
        ) : (
          <p className="text-sm italic text-blue-200 text-center mb-3">Proud sponsor of Calusa Elementary</p>
        )}
        {s.website_url && (
          <span className="inline-flex items-center gap-1 bg-yellow-400 text-blue-900 font-bold text-xs px-3 py-1.5 rounded-full shadow">
            Visit site <ArrowRight size={12} />
          </span>
        )}
      </div>
    </a>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={32} className="text-yellow-500" />
            <h1 className="text-4xl font-black text-gray-900">Our Sponsors</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Thank you to our wonderful sponsors who support Calusa Elementary students!
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading sponsors…</p>
        ) : sponsors.length === 0 ? (
          <p className="text-center text-gray-500 mb-16" data-testid="no-sponsors-msg">
            We're looking for community partners — contact us to become our first sponsor!
          </p>
        ) : (
          <>
            {tiers.platinum.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Platinum Sponsors</h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {tiers.platinum.map((s) => (
                    <SponsorLink key={s.id} s={s} className="p-8 w-full max-w-md h-48" nameSize="text-2xl" />
                  ))}
                </div>
              </div>
            )}
            {tiers.gold.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Gold Sponsors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tiers.gold.map((s) => (
                    <SponsorLink key={s.id} s={s} className="p-6 h-40" nameSize="text-xl" />
                  ))}
                </div>
              </div>
            )}
            {tiers.silver.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Silver Sponsors</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {tiers.silver.map((s) => (
                    <SponsorLink key={s.id} s={s} className="p-4 h-32" nameSize="text-base" />
                  ))}
                </div>
              </div>
            )}
            {tiers.bronze.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xl font-bold text-center mb-6 text-gray-900">Bronze Sponsors</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tiers.bronze.map((s) => (
                    <SponsorLink key={s.id} s={s} className="p-3 h-24" nameSize="text-sm" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
          <p className="text-xl mb-6">
            Support Calusa Elementary students and get featured on our platform!
          </p>
          <div className="flex items-center justify-center gap-8 text-lg flex-wrap">
            <div className="flex items-center gap-2">
              <Mail size={20} />
              <span>sponsors@calusaschool.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={20} />
              <span>(555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SponsorsPage;
