import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Palette, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { assetUrl } from '../lib/api';

const StudentArtPage = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/art')
      .then((res) => setArtworks(res.data))
      .catch(() => setArtworks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Palette size={32} className="text-purple-600" />
              <h1 className="text-4xl font-black text-gray-900">Student Art Gallery</h1>
            </div>
            <p className="text-gray-600">
              Showcasing the amazing creativity of Calusa students! Upload a picture of your
              favorite art work or picture you took to share with our community.
            </p>
          </div>
          <Link to="/submit-art">
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              data-testid="submit-art-btn"
            >
              <Palette size={18} className="mr-2" />
              Submit Your Art
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : artworks.length === 0 ? (
          <p className="text-gray-500" data-testid="no-art-msg">
            No artwork yet. Be the first to submit!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
                data-testid={`art-card-${art.id}`}
              >
                <div className="relative h-64 overflow-hidden">
                  {art.image_url ? (
                    <img
                      src={assetUrl(art.image_url)}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Palette size={40} className="text-gray-300" />
                    </div>
                  )}
                  {art.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star size={12} className="fill-yellow-900" /> Featured
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{art.title}</h3>
                  {art.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{art.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-purple-600">{art.artist_name}</span>
                    {art.grade && <span className="text-gray-500">{art.grade}</span>}
                  </div>
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

export default StudentArtPage;
