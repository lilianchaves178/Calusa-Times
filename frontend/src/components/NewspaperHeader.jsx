import React from 'react';
import { Calendar, Edit, Star } from 'lucide-react';

const NewspaperHeader = () => {
  return (
    <div className="bg-white py-6 border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top decorative line */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          <Star size={16} className="text-yellow-400" fill="#FBBF24" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs mb-4 text-gray-600">
          <div>VOL. 7 • ISSUE 16</div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Thursday, April 16, 2026</span>
          </div>
          <div>EST. 2019</div>
        </div>

        {/* Main title with decorative stars */}
        <div className="text-center mb-4 relative">
          <Star className="absolute left-20 top-4 text-yellow-400" size={24} fill="#FBBF24" />
          <Star className="absolute right-20 top-4 text-yellow-400" size={24} fill="#FBBF24" />

          <h1 className="text-6xl font-black text-[#0f1e42] mb-3"
              style={{fontFamily: 'Georgia, serif'}}>
            The Calusa Times
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-0.5 w-24 bg-[#0f1e42]"></div>
            <div className="h-0.5 w-24 bg-[#0f1e42]"></div>
          </div>
          
          <p className="text-sm font-bold text-[#0f1e42] uppercase tracking-widest" 
             style={{fontFamily: 'Georgia, serif'}}>
            Calusa Elementary School's Student Gazette
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-0.5 w-24 bg-[#0f1e42]"></div>
            <div className="h-0.5 w-24 bg-[#0f1e42]"></div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-700 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Edit size={14} />
            <span style={{fontFamily: 'Georgia, serif'}}>Written by Calusa Students</span>
          </div>
          <span>•</span>
          <span className="font-bold" style={{fontFamily: 'Georgia, serif'}}>STUDENT-POWERED SINCE 2019</span>
          <span>•</span>
          <span className="bg-yellow-400 text-[#0f1e42] px-2 py-1 font-bold text-[10px] uppercase tracking-wider">
            Platinum STEM School
          </span>
        </div>

        {/* Bottom decorative line */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          <Star size={16} className="text-[#0f1e42]" fill="#0f1e42" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default NewspaperHeader;