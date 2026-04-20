import React from 'react';

const NewspaperHeader = () => {
  return (
    <div className="bg-white py-4 border-b-2 border-[#0f1e42]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative border-2 border-[#0f1e42] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://customer-assets.emergentagent.com/job_kid-news-refresh/artifacts/6s7hepki_Gemini_Generated_Image_vuim8qvuim8qvuim.png"
              alt="Calusa Elementary School"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative py-6 px-8 flex items-center justify-between border-b-4 border-t-4 border-[#0f1e42]">
            <div className="flex-1">
              <h1 className="text-5xl lg:text-6xl font-black text-[#0f1e42] leading-none mb-2" 
                  style={{fontFamily: 'Georgia, serif'}}>
                The Calusa Times
              </h1>
              <p className="text-sm text-gray-700 italic mb-1" style={{fontFamily: 'Georgia, serif'}}>
                "Always a Step Ahead"
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-600 uppercase tracking-wider" style={{fontFamily: 'Georgia, serif'}}>
                <span className="font-bold">Student Gazette</span>
                <span>|</span>
                <span>Est. 2019</span>
                <span>|</span>
                <span className="text-[#0f1e42] font-bold">Written by Students</span>
              </div>
            </div>

            {/* Decorative element to show image through */}
            <div className="hidden lg:block w-64 h-32 relative">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/80"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewspaperHeader;
