import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0f1e42] text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
              <span className="text-[#0f1e42] font-bold text-xl">C</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">The Calusa Times</h3>
              <p className="text-sm text-gray-300">Calusa Elementary School</p>
            </div>
          </div>

          <div className="text-sm text-gray-300">
            Made with <span className="text-red-400">♥</span> by Calusa Students
          </div>

          <a 
            href="#" 
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Visit School Website
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
