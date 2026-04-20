import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentArtPage = () => {
  // Mock data - will be replaced with API call
  const artworks = [
    {
      id: '1',
      title: 'Sunset Dreams',
      artist_name: 'Emma Rodriguez',
      grade: '4th Grade',
      image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80'
    },
    {
      id: '2',
      title: 'Ocean Life',
      artist_name: 'Marcus Chen',
      grade: '5th Grade',
      image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80'
    },
    {
      id: '3',
      title: 'Space Explorer',
      artist_name: 'Lily Patel',
      grade: '3rd Grade',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
    },
    {
      id: '4',
      title: 'Colorful Forest',
      artist_name: 'Noah Williams',
      grade: '4th Grade',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Palette size={32} className="text-purple-600" />
              <h1 className="text-4xl font-black text-gray-900">Student Art Gallery</h1>
            </div>
            <p className="text-gray-600">Showcasing the amazing creativity of Calusa students!</p>
          </div>
          <Link to="/submit-art">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Palette size={18} className="mr-2" />
              Submit Your Art
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((art) => (
            <div key={art.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={art.image_url}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{art.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-purple-600">{art.artist_name}</span>
                  <span className="text-gray-500">{art.grade}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentArtPage;