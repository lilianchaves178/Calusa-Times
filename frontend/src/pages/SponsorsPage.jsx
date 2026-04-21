import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Sparkles, Mail, Phone } from 'lucide-react';
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

  const SponsorLink = ({ s, className }) => (
    <a
      href={s.website_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all flex items-center justify-center ${className}`}
      data-testid={`sponsor-${s.id}`}
    >
      {s.logo_url ? (
        <img src={assetUrl(s.logo_url)} alt={s.name} className="max-w-full max-h-full object-contain" />
      ) : (
        <span className="font-bold text-gray-700 px-4">{s.name}</span>
      )}
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
                    <SponsorLink key={s.id} s={s} className="p-8 w-full max-w-md h-48" />
                  ))}
                </div>
              </div>
            )}
            {tiers.gold.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Gold Sponsors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tiers.gold.map((s) => (
                    <SponsorLink key={s.id} s={s} className="p-6 h-40" />
                  ))}
                </div>
              </div>
            )}
            {tiers.silver.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Silver Sponsors</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {tiers.silver.map((s) => (
                    <SponsorLink key={s.id} s={s} className="p-4 h-32" />
                  ))}
                </div>
              </div>
            )}
            {tiers.bronze.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xl font-bold text-center mb-6 text-gray-900">Bronze Sponsors</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tiers.bronze.map((s) => (
                    <SponsorLink key={s.id} s={s} className="p-3 h-24" />
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
