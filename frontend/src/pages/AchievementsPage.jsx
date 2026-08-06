import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trophy, Award } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const categoryColors = {
  ACADEMIC: 'bg-blue-100 text-blue-700',
  SPORTS: 'bg-green-100 text-green-700',
  LEADERSHIP: 'bg-purple-100 text-purple-700',
  ARTS: 'bg-pink-100 text-pink-700',
  ATTENDANCE: 'bg-yellow-100 text-yellow-700',
  STEM: 'bg-indigo-100 text-indigo-700',
};

const AchievementsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/achievements', { params: { limit: 200 } })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={32} className="text-[#FFD700]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">School Achievements & Awards</h1>
          </div>
          <p className="text-gray-600">
            Celebrating the accomplishments of our incredible Calusa community!
          </p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500" data-testid="no-achievements-msg">
            No achievements yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-[#FFD700] overflow-hidden flex flex-col"
                data-testid={`achievement-${a.id}`}
              >
                {a.image_url && (
                  <div className="w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={assetUrl(a.image_url)}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    {!a.image_url && (
                      <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center flex-shrink-0">
                        <Award size={28} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-2 ${
                          categoryColors[a.category] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {a.category}
                      </span>
                      <h3 className="font-bold text-[#0f1e42] text-lg leading-tight">{a.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-700 font-semibold mb-2">{a.recipient}</p>
                  {a.description && <p className="text-sm text-gray-600">{a.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AchievementsPage;
