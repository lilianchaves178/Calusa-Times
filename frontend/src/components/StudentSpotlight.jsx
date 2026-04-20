import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { spotlight } from '../mockData';

const StudentSpotlight = () => {
  return (
    <div className="bg-[#0f1e42] rounded-2xl p-6 text-white relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-4 right-4 w-32 h-32 bg-[#1a2d5a] rounded-full opacity-30"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#1a2d5a] rounded-full opacity-30"></div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="text-center mb-6">
          <p className="text-[#FFD700] text-sm uppercase tracking-wider font-semibold mb-2">Student</p>
          <p className="text-[#FFD700] text-sm uppercase tracking-wider font-semibold">Spotlight</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-1">
              <div className="w-full h-full rounded-full bg-[#0f1e42] flex items-center justify-center overflow-hidden">
                <img 
                  src={spotlight.image} 
                  alt="Student Spotlight"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center flex-1 flex flex-col justify-center">
          <h3 className="text-2xl font-black mb-1">{spotlight.name}</h3>
          <p className="text-gray-300 text-sm mb-4">{spotlight.grade}</p>
          <blockquote className="italic text-gray-200 text-sm leading-relaxed">
            "{spotlight.quote}"
          </blockquote>
        </div>

        <Link 
          to="/spotlight" 
          className="mt-6 inline-flex items-center gap-2 bg-white text-[#0f1e42] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full justify-center"
        >
          Meet More Stars
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default StudentSpotlight;
