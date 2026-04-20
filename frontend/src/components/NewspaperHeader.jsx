import React from 'react';
import { BookOpen, Atom, Lightbulb, Pencil, Telescope, GraduationCap } from 'lucide-react';

const NewspaperHeader = () => {
  return (
    <div className="bg-[#FFF8E7] py-8 border-b-4 border-[#0f1e42] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left side - Title and Info */}
          <div className="lg:col-span-4 space-y-6 relative z-10">
            <div>
              <h1 className="text-7xl lg:text-8xl font-black text-[#0f1e42] leading-none mb-4" 
                  style={{fontFamily: 'Arial Black, sans-serif', letterSpacing: '0.02em'}}>
                THE<br/>
                CALUSA<br/>
                TIMES
              </h1>
            </div>

            <div className="space-y-3">
              <p className="text-xl text-[#0f1e42] font-semibold italic">
                "Always a Step Ahead"
              </p>
              
              <div className="h-1 bg-[#FFD700] w-full"></div>
              
              <p className="text-sm font-bold text-[#0f1e42] uppercase tracking-wide">
                Student-Powered Since 2019
              </p>
            </div>
          </div>

          {/* Right side - Large School Image with Decorative Icons */}
          <div className="lg:col-span-8 relative">
            {/* Floating decorative icons */}
            <div className="absolute -top-4 left-8 text-[#0f1e42] opacity-60 animate-float">
              <Atom size={32} />
            </div>
            <div className="absolute top-12 left-2 text-[#FF6B6B] opacity-60 animate-float-delayed">
              <BookOpen size={28} />
            </div>
            <div className="absolute top-24 left-12 text-[#4ECDC4] opacity-60 animate-float">
              <Lightbulb size={24} />
            </div>
            <div className="absolute -top-2 right-16 text-[#FFB347] opacity-60 animate-float-delayed">
              <Pencil size={30} />
            </div>
            <div className="absolute top-16 right-4 text-[#0f1e42] opacity-60 animate-float">
              <Telescope size={26} />
            </div>
            <div className="absolute bottom-8 left-4 text-[#DDA0DD] opacity-60 animate-float-delayed">
              <GraduationCap size={28} />
            </div>
            <div className="absolute bottom-16 right-12 text-[#FFD700] opacity-60 animate-float">
              <Atom size={24} />
            </div>

            {/* School Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://customer-assets.emergentagent.com/job_kid-news-refresh/artifacts/6s7hepki_Gemini_Generated_Image_vuim8qvuim8qvuim.png"
                alt="Calusa Elementary School - Student Times Center"
                className="w-full h-auto"
              />
              
              {/* Bottom banner overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#0f1e42] py-3 px-6">
                <p className="text-white text-center font-semibold text-sm uppercase tracking-wide">
                  Written by Calusa Students
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewspaperHeader;
