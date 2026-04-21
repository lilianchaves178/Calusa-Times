import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ChevronLeft, ChevronRight, Trophy, Palette, Sparkles, Newspaper } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const ROTATE_MS = 5000;

// Chip metadata per source. `label` falls back to the entry.category otherwise.
const SOURCE_META = {
  article: { Icon: Newspaper, label: null, accent: 'bg-blue-600 text-white' },
  achievement: { Icon: Trophy, label: 'ACHIEVEMENT', accent: 'bg-[#FFD700] text-[#0f1e42]' },
  art: { Icon: Palette, label: 'STUDENT ART', accent: 'bg-pink-500 text-white' },
  spotlight: { Icon: Sparkles, label: 'SPOTLIGHT', accent: 'bg-purple-600 text-white' },
};

const PhotoOfTheWeek = () => {
  const [photos, setPhotos] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/articles/photos-of-the-week', { params: { limit: 8 } })
      .then((res) => {
        if (!cancelled) setPhotos(res.data?.photos || []);
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (paused || photos.length < 2) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, photos.length]);

  if (loading || photos.length === 0) return null;

  const current = photos[idx];
  const source = current.source || 'article';
  const meta = SOURCE_META[source] || SOURCE_META.article;
  const chipLabel = (meta.label || current.category || 'calusa').toUpperCase();
  const href = current.link || (current.article_id ? `/article/${current.article_id}` : '/');
  const ChipIcon = meta.Icon;

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <section
      className="mb-10"
      data-testid="photo-of-the-week"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Camera className="text-[#0f1e42]" size={22} />
        <h2 className="text-2xl font-bold text-gray-900">Photo of the Week</h2>
        <span className="ml-auto text-xs text-gray-500 uppercase tracking-wide">
          Auto-rotating · {idx + 1}/{photos.length}
        </span>
      </div>

      <Link
        to={href}
        className="group block relative overflow-hidden rounded-2xl border-4 border-[#0f1e42] bg-black shadow-lg"
        data-testid="photo-of-the-week-link"
      >
        <div className="relative aspect-[5/2] max-h-[360px] w-full overflow-hidden">
          {/* Blurred backdrop fills any letterbox gap with the same photo */}
          <img
            src={assetUrl(current.image_url)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
            key={`bg-${current.image_url}`}
          />
          <div className="absolute inset-0 bg-black/30" />
          {/* Main photo — fully visible, no crop */}
          <img
            src={assetUrl(current.image_url)}
            alt={current.title}
            className="relative w-full h-full object-contain transition-transform duration-[6000ms] ease-out group-hover:scale-[1.03]"
            key={current.image_url}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 py-4 text-white">
          <div className="flex items-end gap-3 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded ${meta.accent}`}
              data-testid={`potw-chip-${source}`}
            >
              <ChipIcon size={11} />
              {chipLabel}
            </span>
            <h3 className="text-lg md:text-xl font-bold leading-snug flex-1 min-w-[60%]">
              {current.title}
            </h3>
          </div>
          {current.subtitle && (
            <p className="text-xs text-white/80 mt-1">
              {source === 'achievement' ? `Awarded to ${current.subtitle}` :
               source === 'art' ? `By ${current.subtitle}` :
               source === 'spotlight' ? current.subtitle :
               `By ${current.subtitle}`}
            </p>
          )}
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous photo"
              data-testid="photo-of-the-week-prev"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next photo"
              data-testid="photo-of-the-week-next"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute top-3 right-3 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.preventDefault(); setIdx(i); }}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? 'bg-[#FFD700] w-6' : 'bg-white/60 w-2 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </Link>
    </section>
  );
};

export default PhotoOfTheWeek;
