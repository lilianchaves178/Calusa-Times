import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';
import { achievements } from '../mockData';

const AchievementCard = ({ achievement }) => {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 flex items-start gap-3 transition-all hover:shadow-md hover:border-[#FFD700]">
      <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
        <Trophy size={20} className="text-[#0f1e42]" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-[#0f1e42] text-sm mb-1 leading-tight">{achievement.title}</h4>
        <p className="text-gray-600 text-xs mb-2">{achievement.recipient}</p>
        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide">
          {achievement.category}
        </span>
      </div>
    </div>
  );
};

const AchievementsSection = () => {
  return (
    <div className="bg-[#FFF8E7] rounded-2xl p-6 border-2 border-[#FFD700]">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={24} className="text-[#0f1e42]" />
        <h2 className="text-2xl font-black text-[#0f1e42]">Recent Achievements</h2>
      </div>
      
      <div className="space-y-3 mb-4">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      <Link to="/achievements" className="flex items-center gap-2 text-[#0f1e42] font-semibold hover:gap-3 transition-all">
        See All Achievements
        <ArrowRight size={18} />
      </Link>
    </div>
  );
};

export default AchievementsSection;
