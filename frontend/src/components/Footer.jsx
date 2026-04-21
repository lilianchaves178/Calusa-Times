import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Edit, Shield, Newspaper } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0f1e42] text-white mt-12 print:hidden">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-start">
          {/* Brand */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <img
              src="/branding/calusa-logo.jpg"
              alt="Calusa Elementary — A Step Ahead"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-400/60"
              data-testid="footer-calusa-logo"
            />
            <div>
              <h3 className="font-bold text-lg leading-tight">The Calusa Times</h3>
              <p className="text-xs text-gray-300">Calusa Elementary School</p>
              <p className="text-xs text-gray-400 mt-1">
                Made with <span className="text-red-400">♥</span> by Calusa Students
              </p>
            </div>
          </div>

          {/* CTAs (moved down from the header) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-center">
            <Link
              to="/print"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm text-[#0f1e42] bg-[#FFD700] hover:bg-yellow-400 shadow-md transition-colors"
              data-testid="footer-monthly-newspaper-btn"
            >
              <Newspaper size={16} />
              This Month's Newspaper
            </Link>
            <Link
              to="/submit-story"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm text-[#0f1e42] bg-white hover:bg-gray-100 shadow-md transition-colors"
              data-testid="footer-submit-btn"
            >
              <Edit size={16} />
              Submit a Story
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm text-white border border-white/40 hover:bg-white/10 transition-colors"
              data-testid="footer-admin-btn"
            >
              <Shield size={16} />
              Admin
            </Link>
          </div>

          {/* Social + school link */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-end">
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

        <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} The Calusa Times · Student-powered since 2019
        </div>
      </div>
    </footer>
  );
};

export default Footer;
