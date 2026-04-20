import React from 'react';

const NewspaperHeader = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-yellow-300 leading-none mb-2" 
                style={{fontFamily: 'Georgia, serif', textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
              The Calusa Times
            </h1>
            <p className="text-yellow-100 italic text-lg font-semibold">
              "Always a Step Ahead"
            </p>
            <div className="flex items-center gap-3 text-xs text-blue-100 mt-2">
              <span>Student Gazette</span>
              <span>•</span>
              <span>Est. 2019</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <img 
              src="https://customer-assets.emergentagent.com/job_kid-news-refresh/artifacts/6s7hepki_Gemini_Generated_Image_vuim8qvuim8qvuim.png"
              alt="Calusa Elementary School"
              className="w-80 h-40 object-cover rounded-lg shadow-2xl border-4 border-yellow-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewspaperHeader;