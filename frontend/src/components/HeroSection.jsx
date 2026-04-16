import React from 'react';
import { Calendar, Edit } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="bg-[#FFF8E7] py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-2xl border-4 border-[#0f1e42] overflow-hidden shadow-lg">
          <div className="bg-[#0f1e42] text-white px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="text-[#FFD700]" />
              <span className="text-sm font-medium uppercase tracking-wide">Calusa Elementary School</span>
            </div>
            <div className="flex items-center gap-6 text-xs uppercase tracking-wide">
              <span>Vol. 7 · Issue 16</span>
              <span>Est. 2019</span>
              <Star className="text-[#FFD700]" />
            </div>
          </div>

          <div className="px-12 py-12 text-center relative">
            <div className="absolute top-6 left-8 w-6 h-6 rounded-full bg-yellow-300"></div>
            <div className="absolute top-12 right-12 w-4 h-4 rounded-sm bg-purple-300 rotate-45"></div>
            <div className="absolute bottom-8 left-16 w-5 h-5 rounded-full bg-green-300"></div>
            <div className="absolute bottom-12 right-20 w-6 h-6 rounded-sm bg-red-300"></div>
            <div className="absolute top-20 right-32 w-3 h-3 rounded-full bg-blue-300"></div>

            <p className="text-sm text-gray-600 uppercase tracking-wider mb-4">Student-Powered Since 2019</p>
            <h1 className="text-6xl font-black text-[#0f1e42] mb-4">The Calusa Canvas</h1>
            <p className="text-gray-600 italic text-lg mb-6">"All the news that's fit to color"</p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Thursday, April 16, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit size={16} />
                <span>Written by Calusa Kids</span>
              </div>
            </div>
          </div>

          <div className="h-3 flex">
            <div className="flex-1 bg-[#FFD700]"></div>
            <div className="flex-1 bg-[#FF6B6B]"></div>
            <div className="flex-1 bg-[#4ECDC4]"></div>
            <div className="flex-1 bg-[#95E1D3]"></div>
            <div className="flex-1 bg-[#FFB347]"></div>
            <div className="flex-1 bg-[#DDA0DD]"></div>
            <div className="flex-1 bg-[#87CEEB]"></div>
            <div className="flex-1 bg-[#FFD700]"></div>
            <div className="flex-1 bg-[#98D8C8]"></div>
            <div className="flex-1 bg-[#0f1e42]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Star = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default HeroSection;
