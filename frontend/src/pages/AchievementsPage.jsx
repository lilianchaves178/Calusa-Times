import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trophy } from 'lucide-react';
import { achievements } from '../mockData';

const allAchievements = [
  ...achievements,
  {
    id: '5',
    title: 'Perfect Attendance Award',
    recipient: 'James Peterson',
    category: 'ATTENDANCE',
    badge: 'attendance'
  },
  {
    id: '6',
    title: 'Math Competition 1st Place',
    recipient: 'Sophia Chen',
    category: 'ACADEMIC',
    badge: 'academic'
  },
  {
    id: '7',
    title: 'Community Service Leader',
    recipient: 'Olivia Martinez',
    category: 'LEADERSHIP',
    badge: 'leadership'
  },
  {
    id: '8',
    title: 'Outstanding Music Performance',
    recipient: 'Ethan Brown',
    category: 'ARTS',
    badge: 'arts'
  }
];

const AchievementsPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={32} className="text-[#0f1e42]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">Achievements</h1>
          </div>
          <p className="text-gray-600">Celebrating the accomplishments of our Calusa community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.map((achievement) => (
            <div key={achievement.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 transition-all hover:shadow-lg hover:border-[#FFD700]">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy size={24} className="text-[#0f1e42]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0f1e42] text-lg mb-2 leading-tight">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{achievement.recipient}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded uppercase tracking-wide">
                    {achievement.category}
                  </span>
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

export default AchievementsPage;
