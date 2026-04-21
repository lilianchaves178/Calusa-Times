import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { MessageSquare, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const colorClasses = {
  yellow: 'bg-yellow-200 shadow-yellow-400/50',
  pink: 'bg-pink-200 shadow-pink-400/50',
  blue: 'bg-blue-200 shadow-blue-400/50',
  green: 'bg-green-200 shadow-green-400/50',
  orange: 'bg-orange-200 shadow-orange-400/50',
  purple: 'bg-purple-200 shadow-purple-400/50',
};

const MuralPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/mural')
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div
        className="bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 py-12 min-h-[80vh]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare size={32} className="text-yellow-300" />
                <h1 className="text-4xl font-black text-white">Community Mural</h1>
              </div>
              <p className="text-yellow-100">
                A fun cork board where families can share messages, celebrations, and encouragement!
              </p>
            </div>
            <Link to="/post-message">
              <Button
                className="bg-yellow-300 text-amber-900 hover:bg-yellow-400 font-bold shadow-xl"
                data-testid="post-message-btn"
              >
                <Plus size={18} className="mr-2" />
                Post a Message
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-white/80">Loading messages…</p>
          ) : messages.length === 0 ? (
            <div className="bg-white/90 backdrop-blur rounded-2xl p-12 text-center">
              <p className="text-gray-700 text-lg font-semibold mb-2">The cork board is bare!</p>
              <p className="text-gray-600">Be the first to pin a message.</p>
            </div>
          ) : (
            <>
              {/* Featured row — max 2 side by side */}
              {messages.some((m) => m.tier === 'featured') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {messages
                    .filter((m) => m.tier === 'featured')
                    .slice(0, 2)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`${colorClasses[msg.color] || 'bg-yellow-200'} p-8 rounded-sm shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] relative ring-4 ring-yellow-400`}
                        style={{ transform: `rotate(${msg.rotation || 0}deg)` }}
                        data-testid={`mural-message-${msg.id}`}
                      >
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="w-6 h-6 bg-red-600 rounded-full shadow-lg border-2 border-red-800"></div>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                          <Star size={12} className="fill-yellow-900" /> Featured
                        </div>
                        <div className="mt-4">
                          <p className="text-gray-800 font-handwriting text-2xl mb-4 leading-relaxed">
                            {msg.message}
                          </p>
                          <p className="text-gray-600 text-sm font-semibold text-right">
                            - {msg.author_name}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Plain messages grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {messages
                  .filter((m) => m.tier !== 'featured')
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`${colorClasses[msg.color] || 'bg-yellow-200'} p-6 rounded-sm shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 relative`}
                      style={{ transform: `rotate(${msg.rotation || 0}deg)` }}
                      data-testid={`mural-message-${msg.id}`}
                    >
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-6 h-6 bg-red-600 rounded-full shadow-lg border-2 border-red-800"></div>
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-800 font-handwriting text-lg mb-4 leading-relaxed">
                          {msg.message}
                        </p>
                        <p className="text-gray-600 text-sm font-semibold text-right">
                          - {msg.author_name}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          <div className="mt-12 bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">✍️</div>
                <h3 className="font-bold text-gray-900 mb-2">1. Write Your Message</h3>
                <p className="text-gray-600 text-sm">
                  Share a birthday wish, congratulations, or words of encouragement
                </p>
              </div>
              <div>
                <div className="text-4xl mb-2">💳</div>
                <h3 className="font-bold text-gray-900 mb-2">2. Donate via Givebacks</h3>
                <p className="text-gray-600 text-sm">
                  $3 plain or $5 featured — 100% goes to Calusa students
                </p>
              </div>
              <div>
                <div className="text-4xl mb-2">📌</div>
                <h3 className="font-bold text-gray-900 mb-2">3. See It on the Mural!</h3>
                <p className="text-gray-600 text-sm">
                  Once payment is verified, your message appears on the cork board
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        .font-handwriting { font-family: 'Permanent Marker', cursive; }
      `}</style>
    </div>
  );
};

export default MuralPage;
