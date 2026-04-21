import React from 'react';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0f1e42] text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img
              src="/branding/calusa-logo.jpg"
              alt="Calusa Elementary — A Step Ahead"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-400/60"
              data-testid="footer-calusa-logo"
            />
            <div>
              <h3 className="font-bold text-lg">The Calusa Times</h3>
              <p className="text-sm text-gray-300">Calusa Elementary School</p>
            </div>
          </div>

          <div className="text-sm text-gray-300">
            Made with <span className="text-red-400">♥</span> by Calusa Students
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/calusaelemschool/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Calusa Elementary on Instagram"
              data-testid="footer-instagram-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-white bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:scale-105 shadow-lg transition-transform"
            >
              <Instagram size={16} />
              Follow us
            </a>
            <a
              href="https://www.calusaschool.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
              data-testid="footer-school-website-link"
            >
              Visit School Website
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
