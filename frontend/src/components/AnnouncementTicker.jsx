import React from 'react';
import { Star } from 'lucide-react';
import { announcements } from '../mockData';

const AnnouncementTicker = () => {
  const doubledAnnouncements = [...announcements, ...announcements];

  return (
    <div className="bg-[#0f1e42] text-[#FFD700] py-2 overflow-hidden">
      <div className="animate-scroll flex">
        {doubledAnnouncements.map((announcement, index) => (
          <div key={index} className="flex items-center gap-2 px-6 whitespace-nowrap">
            <Star size={16} fill="#FFD700" />
            <span className="text-sm font-medium">{announcement}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementTicker;
