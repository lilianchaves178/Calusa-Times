import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const StudentSpotlight = () => {
  const [spotlight, setSpotlight] = useState(null);

  useEffect(() => {
    api
      .get('/spotlight')
      .then((res) => setSpotlight(res.data[0] || null))
      .catch(() => setSpotlight(null));
  }, []);

  if (!spotlight) {
    return (
      <div className="bg-[#0f1e42] rounded-2xl p-6 text-white h-full flex flex-col items-center justify-center text-center min-h-[360px]">
        <p className="text-[#FFD700] text-sm uppercase tracking-wider font-semibold mb-2">
          Student Spotlight
        </p>
        <p className="text-gray-300 text-sm">Coming soon!</p>
      </div>
    );
  }

  return (
    <div
      className="group relative rounded-2xl overflow-hidden h-full min-h-[480px] bg-[#0f1e42] text-white flex flex-col shadow-lg"
      data-testid="student-spotlight-card"
    >
      {/* HERO IMAGE — top 65% of the card */}
      <div className="relative flex-1 min-h-[280px] overflow-hidden">
        {spotlight.image_url ? (
          <img
            src={assetUrl(spotlight.image_url)}
            alt={spotlight.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
            <span className="text-7xl font-black text-[#0f1e42]">
              {spotlight.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gold ribbon top-left */}
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-[#FFD700] text-[#0f1e42] text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full shadow-md">
          <Sparkles size={12} />
          Student Spotlight
        </div>

        {/* Gradient overlay so the name/quote can sit on top of the image */}
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0f1e42] via-[#0f1e42]/80 to-transparent" />

        {/* Name + grade overlaid on the lower portion of the image */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <h3 className="text-2xl md:text-3xl font-black leading-tight drop-shadow">
            {spotlight.name}
          </h3>
          {spotlight.grade && (
            <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wider mt-0.5">
              {spotlight.grade}
            </p>
          )}
        </div>
      </div>

      {/* QUOTE + CTA — compact dark band */}
      <div className="px-4 py-4 bg-[#0f1e42]">
        <blockquote className="italic text-gray-200 text-sm leading-snug mb-3 line-clamp-3">
          &ldquo;{spotlight.quote}&rdquo;
        </blockquote>
        <Link
          to="/spotlight"
          className="inline-flex items-center justify-center gap-2 bg-[#FFD700] text-[#0f1e42] px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors w-full"
          data-testid="meet-more-stars-btn"
        >
          Meet More Stars
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default StudentSpotlight;
