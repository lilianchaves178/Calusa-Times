import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CalendarDays } from 'lucide-react';
import api from '../lib/api';
import './AnnouncementTicker.css';

const CATEGORY_CHIP = {
  FIELD_TRIP: 'bg-sky-400',
  HOLIDAY: 'bg-red-400',
  ASSEMBLY: 'bg-indigo-400',
  PARENT: 'bg-pink-400',
  SPORTS: 'bg-emerald-400',
  ARTS: 'bg-fuchsia-400',
  FUNDRAISER: 'bg-amber-400',
  ACADEMIC: 'bg-yellow-400',
  OTHER: 'bg-slate-400',
};

const formatShort = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
};

const AnnouncementTicker = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/events/upcoming', { params: { limit: 8 } })
      .then((res) => {
        if (!cancelled) setEvents(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => { cancelled = true; };
  }, []);

  if (events.length === 0) return null;

  // Double the list so the CSS scroll loops seamlessly
  const loop = [...events, ...events];

  return (
    <div
      className="bg-[#0f1e42] text-[#FFD700] py-2 overflow-hidden border-b border-[#FFD700]/30 print:hidden"
      data-testid="announcement-ticker"
    >
      <div className="relative flex items-center">
        <div className="hidden sm:flex items-center gap-1.5 px-3 text-[11px] uppercase tracking-[0.2em] font-bold bg-[#FFD700] text-[#0f1e42] py-1 flex-shrink-0 z-10">
          <Sparkles size={13} />
          Upcoming
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="announcement-track flex whitespace-nowrap">
            {loop.map((e, i) => (
              <Link
                key={`${e.id}-${i}`}
                to="/events"
                className="flex items-center gap-2 px-5 text-sm font-medium hover:text-white transition-colors"
                data-testid={`ticker-event-${i}`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${CATEGORY_CHIP[e.category] || 'bg-white'}`}
                  aria-hidden="true"
                />
                <CalendarDays size={13} className="opacity-70" />
                <span className="opacity-80">{formatShort(e.start)}</span>
                <span>·</span>
                <span>{e.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementTicker;
