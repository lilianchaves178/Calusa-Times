import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { assetUrl } from '../lib/api';

const ROTATE_MS = 5000;

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
        to={`/article/${current.article_id}`}
        className="group block relative overflow-hidden rounded-2xl border-4 border-[#0f1e42] bg-black shadow-lg"
        data-testid="photo-of-the-week-link"
      >
        <div className="aspect-[16/7] w-full">
          <img
            src={assetUrl(current.image_url)}
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-105"
            key={current.image_url}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 py-4 text-white">
          <div className="flex items-end gap-3 flex-wrap">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] bg-[#FFD700] text-[#0f1e42] px-2 py-0.5 rounded">
              {current.category || 'calusa'}
            </span>
            <h3 className="text-lg md:text-xl font-bold leading-snug flex-1 min-w-[60%]">
              {current.title}
            </h3>
          </div>
          {current.author && (
            <p className="text-xs text-white/80 mt-1">By {current.author}</p>
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
