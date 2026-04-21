import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MuralPage = () => {
  // Mock data - colorful post-it notes
  const messages = [
    { id: '1', message: 'Happy Birthday Sarah! 🎉', author_name: 'Mom & Dad', color: 'yellow', rotation: -3 },
    { id: '2', message: 'Great job on the science fair!', author_name: 'The Johnsons', color: 'pink', rotation: 2 },
    { id: '3', message: 'Congratulations on making the honor roll! 📚', author_name: 'Grandma', color: 'blue', rotation: -2 },
    { id: '4', message: 'You rock! Keep being awesome! 🌟', author_name: 'Uncle Mike', color: 'green', rotation: 4 },
    { id: '5', message: 'Happy 10th Birthday Emma! 🎂', author_name: 'The Smiths', color: 'orange', rotation: -4 },
    { id: '6', message: 'Way to go on the spelling bee!', author_name: 'Aunt Lisa', color: 'purple', rotation: 3 },
    { id: '7', message: 'You\'re a star! ⭐', author_name: 'Coach Tom', color: 'yellow', rotation: -1 },
    { id: '8', message: 'Proud of you always! 💙', author_name: 'Mom', color: 'pink', rotation: 2 },
    { id: '9', message: 'Congrats on the soccer win! ⚽', author_name: 'Dad', color: 'blue', rotation: -3 },
    { id: '10', message: 'Keep shining bright! ✨', author_name: 'Mrs. Garcia', color: 'green', rotation: 1 }
  ];

  const colorClasses = {
    yellow: 'bg-yellow-200 shadow-yellow-400/50',
    pink: 'bg-pink-200 shadow-pink-400/50',
    blue: 'bg-blue-200 shadow-blue-400/50',
    green: 'bg-green-200 shadow-green-400/50',
    orange: 'bg-orange-200 shadow-orange-400/50',
    purple: 'bg-purple-200 shadow-purple-400/50'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Cork board texture background */}
      <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 py-12" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
           }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare size={32} className="text-yellow-300" />
                <h1 className="text-4xl font-black text-white">Community Mural</h1>
              </div>
              <p className="text-yellow-100">A fun cork board where families can share messages, celebrations, and encouragement!</p>
            </div>
            <Link to="/post-message">
              <Button className="bg-yellow-300 text-amber-900 hover:bg-yellow-400 font-bold shadow-xl">
                <Plus size={18} className="mr-2" />
                Post a Message
              </Button>
            </Link>
          </div>

          {/* Post-it notes grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${colorClasses[msg.color]} p-6 rounded-sm shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer relative`}
                style={{
                  transform: `rotate(${msg.rotation}deg)`,
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Pin/tack at top */}
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

          {/* Info box */}
          <div className="mt-12 bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">✍️</div>
                <h3 className="font-bold text-gray-900 mb-2">1. Write Your Message</h3>
                <p className="text-gray-600 text-sm">Share a birthday wish, congratulations, or words of encouragement</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💳</div>
                <h3 className="font-bold text-gray-900 mb-2">2. Make a Small Donation</h3>
                <p className="text-gray-600 text-sm">$5 per message supports our student programs</p>
              </div>
              <div>
                <div className="text-4xl mb-2">📌</div>
                <h3 className="font-bold text-gray-900 mb-2">3. See It on the Mural!</h3>
                <p className="text-gray-600 text-sm">Your message appears on our community cork board</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        .font-handwriting {
          font-family: 'Permanent Marker', cursive;
        }
      `}</style>
    </div>
  );
};

export default MuralPage;