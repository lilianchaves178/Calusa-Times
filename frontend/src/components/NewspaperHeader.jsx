import React from 'react';
import { Star } from 'lucide-react';

const formattedToday = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

/**
 * Compact gazette masthead that sits between the site header and the content.
 * Redesigned (iter 16) to take ~60% less vertical space while keeping the
 * newspaper flair — one double-rule, metadata line, tight title block.
 */
const NewspaperHeader = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Metadata line */}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">
          <span>Vol. 7 · Issue 16</span>
          <span className="hidden sm:inline">{formattedToday}</span>
          <span>Est. 2019</span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-center gap-3">
          <Star size={14} className="text-yellow-400 hidden sm:block" fill="#FBBF24" />
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f1e42] leading-none tracking-tight"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            The Calusa Times
          </h1>
          <Star size={14} className="text-yellow-400 hidden sm:block" fill="#FBBF24" />
        </div>

        {/* Tagline */}
        <p
          className="text-center text-[11px] sm:text-xs text-[#0f1e42]/80 tracking-[0.15em] uppercase mt-1"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Calusa Elementary · Student-powered since 2019 ·{' '}
          <span className="bg-yellow-400 text-[#0f1e42] px-1.5 py-0.5 font-bold rounded-sm">
            Platinum STEM
          </span>
        </p>
      </div>
    </div>
  );
};

export default NewspaperHeader;
