import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Star } from 'lucide-react';
import { spotlight } from '../mockData';

const spotlightStudents = [
  { ...spotlight },
  {
    name: 'Marcus Chen',
    grade: '4th Grade',
    quote: 'Every day is a chance to learn something new!',
    image: spotlight.image
  },
  {
    name: 'Emma Rodriguez',
    grade: '3rd Grade',
    quote: 'Kindness is the most important thing!',
    image: spotlight.image
  },
  {
    name: 'Noah Williams',
    grade: '5th Grade',
    quote: 'Dream big and work hard!',
    image: spotlight.image
  }
];

const SpotlightPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users size={32} className="text-[#0f1e42]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">Student Spotlight</h1>
          </div>
          <p className="text-gray-600">Celebrating our amazing students and their achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spotlightStudents.map((student, index) => (
            <div key={index} className="bg-[#0f1e42] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 w-20 h-20 bg-[#1a2d5a] rounded-full opacity-30"></div>
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-1">
                    <div className="w-full h-full rounded-full bg-[#0f1e42] flex items-center justify-center overflow-hidden">
                      <img 
                        src={student.image} 
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <Star className="text-[#FFD700] mx-auto mb-2" size={20} fill="#FFD700" />
                <h3 className="text-xl font-bold mb-1">{student.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{student.grade}</p>
                <blockquote className="italic text-gray-200 text-sm leading-relaxed">
                  "{student.quote}"
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SpotlightPage;
