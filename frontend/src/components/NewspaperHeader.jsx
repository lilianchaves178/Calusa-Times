import React from 'react';
import { Calendar, Edit, Star } from 'lucide-react';

const NewspaperHeader = () => {
  return (
    <div className="bg-gradient-to-b from-white to-[#FFF8E7] py-8 border-b-4 border-[#0f1e42]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top metadata row */}
        <div className="flex items-center justify-between text-xs mb-6 text-gray-600">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f1e42]">VOL. 7</span>
            <span className="text-[#FFD700]">★</span>
            <span className="font-bold text-[#0f1e42]">ISSUE 16</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span className="font-medium">Thursday, April 16, 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f1e42]">EST. 2019</span>
            <span className="text-[#FFD700]">★</span>
            <span className="bg-[#FFD700] text-[#0f1e42] px-2 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">Platinum STEM</span>
          </div>
        </div>

        {/* Main masthead area */}
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-100 rounded-full opacity-30 blur-3xl"></div>
          
          <div className="relative text-center mb-6">
            {/* Newspaper title */}
            <div className="mb-4">
              <h1 className="text-6xl lg:text-7xl font-black text-[#0f1e42] mb-2 tracking-tight leading-none" 
                  style={{fontFamily: 'Georgia, serif'}}>
                The Calusa Times
              </h1>
              <div className="flex items-center justify-center gap-3 my-3">
                <div className="h-px bg-[#0f1e42] w-20"></div>
                <Star size={12} className="text-[#FFD700]" fill="#FFD700" />
                <div className="h-px bg-[#0f1e42] w-20"></div>
              </div>
              <p className="text-sm font-semibold text-[#0f1e42] uppercase tracking-[0.3em] mb-2">
                Student Gazette
              </p>
            </div>

            {/* School image - smaller and centered */}
            <div className="flex justify-center mb-4">
              <div className="relative w-64 lg:w-80 rounded-xl overflow-hidden shadow-xl border-3 border-[#0f1e42] transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://customer-assets.emergentagent.com/job_kid-news-refresh/artifacts/6s7hepki_Gemini_Generated_Image_vuim8qvuim8qvuim.png"
                  alt="Calusa Elementary School"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f1e42]/80 to-transparent py-2 px-3">
                  <p className="text-white text-xs font-semibold text-center">Calusa Elementary School</p>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="inline-block bg-white px-8 py-3 rounded-full shadow-md border-2 border-[#0f1e42]">
              <p className="text-[#0f1e42] italic text-lg font-semibold">
                "Always a Step Ahead"
              </p>
            </div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600 border-t-2 border-[#FFD700] pt-4 mt-4">
          <div className="flex items-center gap-2">
            <Edit size={14} className="text-[#0f1e42]" />
            <span className="font-medium">Written by Calusa Students</span>
          </div>
          <span className="text-[#FFD700]">•</span>
          <span className="font-bold text-[#0f1e42] uppercase tracking-wide">Student-Powered Since 2019</span>
        </div>
      </div>
    </div>
  );
};

export default NewspaperHeader;
