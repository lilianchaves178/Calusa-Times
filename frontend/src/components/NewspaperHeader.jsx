import React from 'react';

const NewspaperHeader = () => {
  return (
    <div className="bg-gradient-to-b from-white via-[#FFFBF5] to-[#FFF8E7] py-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left side - Compact Title */}
          <div className="lg:col-span-5 space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black text-[#0f1e42] leading-tight" 
                style={{fontFamily: 'Georgia, serif'}}>
              The Calusa Times
            </h1>
            
            <p className="text-sm text-gray-600 italic">
              "Always a Step Ahead"
            </p>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="font-medium">Student Gazette</span>
              <span>•</span>
              <span>Est. 2019</span>
            </div>
          </div>

          {/* Right side - Compact School Image */}
          <div className="lg:col-span-7">
            <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src="https://customer-assets.emergentagent.com/job_kid-news-refresh/artifacts/6s7hepki_Gemini_Generated_Image_vuim8qvuim8qvuim.png"
                alt="Calusa Elementary School"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f1e42]/90 to-transparent py-2 px-4">
                <p className="text-white text-xs font-medium text-center">
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
