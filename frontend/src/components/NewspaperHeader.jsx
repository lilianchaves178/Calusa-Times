import React from 'react';
import { Calendar, Edit, Star } from 'lucide-react';

const NewspaperHeader = () => {
  return (
    <div className="bg-white py-8 border-b-4 border-[#0f1e42]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top decorative border */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-[#0f1e42] to-transparent"></div>
          <Star size={16} className="text-[#FFD700]" fill="#FFD700" />
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-[#0f1e42] to-transparent"></div>
        </div>

        {/* Newspaper metadata row */}
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-semibold">VOL. 7</span>
            <span>•</span>
            <span className="font-semibold">ISSUE 16</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} />
            <span className="font-medium">Thursday, April 16, 2026</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-semibold">EST. 2019</span>
          </div>
        </div>

        {/* Main masthead */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-2 -left-8">
                <svg width="40" height="40" viewBox="0 0 40 40" className="text-[#FFD700] opacity-50">
                  <path fill="currentColor" d="M20 5 L23 15 L33 15 L25 21 L28 31 L20 25 L12 31 L15 21 L7 15 L17 15 Z"/>
                </svg>
              </div>
              <div className="absolute -top-2 -right-8">
                <svg width="40" height="40" viewBox="0 0 40 40" className="text-[#FFD700] opacity-50">
                  <path fill="currentColor" d="M20 5 L23 15 L33 15 L25 21 L28 31 L20 25 L12 31 L15 21 L7 15 L17 15 Z"/>
                </svg>
              </div>
              
              <h1 className="text-7xl font-black text-[#0f1e42] mb-2 tracking-tight" style={{fontFamily: 'Georgia, serif'}}>
                The Calusa Times
              </h1>
            </div>
            
            <div className="border-t-2 border-b-2 border-[#0f1e42] py-2 mb-3">
              <p className="text-sm font-bold text-[#0f1e42] uppercase tracking-widest">
                Calusa Elementary School's Student Gazette
              </p>
            </div>
            
            <p className="text-gray-600 italic text-base">
              "All the News That's Fit for Kids"
            </p>
          </div>
        </div>

        {/* Bottom info row */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600 border-t border-gray-300 pt-4">
          <div className="flex items-center gap-2">
            <Edit size={14} />
            <span>Written by Calusa Students</span>
          </div>
          <span>•</span>
          <span className="font-semibold">STUDENT-POWERED SINCE 2019</span>
          <span>•</span>
          <span className="bg-[#FFD700] text-[#0f1e42] px-2 py-1 rounded font-bold">PLATINUM STEM SCHOOL</span>
        </div>

        {/* Decorative bottom border */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>
          <Star size={16} className="text-[#0f1e42]" fill="#0f1e42" />
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default NewspaperHeader;
