import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Sparkles, Globe, Phone, Mail } from 'lucide-react';

const SponsorsPage = () => {
  // Mock data - will be replaced with API call
  const sponsors = {
    platinum: [
      { id: '1', name: 'Calusa Community Bank', logo_url: 'https://via.placeholder.com/300x150?text=Platinum+Sponsor', website_url: '#' }
    ],
    gold: [
      { id: '2', name: 'Local Pizza Shop', logo_url: 'https://via.placeholder.com/250x120?text=Gold+Sponsor', website_url: '#' },
      { id: '3', name: 'Family Dentistry', logo_url: 'https://via.placeholder.com/250x120?text=Gold+Sponsor', website_url: '#' }
    ],
    silver: [
      { id: '4', name: 'Book Store', logo_url: 'https://via.placeholder.com/200x100?text=Silver', website_url: '#' },
      { id: '5', name: 'Sports Center', logo_url: 'https://via.placeholder.com/200x100?text=Silver', website_url: '#' },
      { id: '6', name: 'Art Supplies', logo_url: 'https://via.placeholder.com/200x100?text=Silver', website_url: '#' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={32} className="text-yellow-500" />
            <h1 className="text-4xl font-black text-gray-900">Our Sponsors</h1>
          </div>
          <p className="text-gray-600 text-lg mb-8">
            Thank you to our wonderful sponsors who support Calusa Elementary students!
          </p>
        </div>

        {/* Platinum Sponsors */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Platinum Sponsors</h2>
          <div className="flex justify-center">
            {sponsors.platinum.map((sponsor) => (
              <a 
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all"
              >
                <img src={sponsor.logo_url} alt={sponsor.name} className="max-w-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Gold Sponsors */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Gold Sponsors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sponsors.gold.map((sponsor) => (
              <a 
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all flex items-center justify-center"
              >
                <img src={sponsor.logo_url} alt={sponsor.name} className="max-w-xs" />
              </a>
            ))}
          </div>
        </div>

        {/* Silver Sponsors */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Silver Sponsors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sponsors.silver.map((sponsor) => (
              <a 
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center justify-center"
              >
                <img src={sponsor.logo_url} alt={sponsor.name} className="max-w-full" />
              </a>
            ))}
          </div>
        </div>

        {/* Become a Sponsor CTA */}
        <div className="bg-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
          <p className="text-xl mb-6">Support Calusa Elementary students and get featured on our platform!</p>
          <div className="flex items-center justify-center gap-8 text-lg">
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