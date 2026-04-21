import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  CalendarDays, ChevronLeft, ChevronRight, MapPin, Download, Link as LinkIcon, Clock, Sparkles, RotateCcw,
} from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../hooks/use-toast';

const CATEGORY_COLORS = {
  FIELD_TRIP: { bg: 'bg-sky-100', border: 'border-sky-300', dot: 'bg-sky-500', text: 'text-sky-900' },
  HOLIDAY: { bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-500', text: 'text-red-900' },
  ASSEMBLY: { bg: 'bg-indigo-100', border: 'border-indigo-300', dot: 'bg-indigo-500', text: 'text-indigo-900' },
  PARENT: { bg: 'bg-pink-100', border: 'border-pink-300', dot: 'bg-pink-500', text: 'text-pink-900' },
  SPORTS: { bg: 'bg-emerald-100', border: 'border-emerald-300', dot: 'bg-emerald-500', text: 'text-emerald-900' },
  ARTS: { bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', dot: 'bg-fuchsia-500', text: 'text-fuchsia-900' },
  FUNDRAISER: { bg: 'bg-amber-100', border: 'border-amber-300', dot: 'bg-amber-500', text: 'text-amber-900' },
  ACADEMIC: { bg: 'bg-yellow-100', border: 'border-yellow-400', dot: 'bg-yellow-500', text: 'text-yellow-900' },
  OTHER: { bg: 'bg-slate-100', border: 'border-slate-300', dot: 'bg-slate-500', text: 'text-slate-900' },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const buildGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const startCol = first.getDay();
  const start = new Date(year, month, 1 - startCol);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
};

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
};
const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  } catch { return ''; }
};

const EventsPage = () => {
  const { toast } = useToast();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/events')
      .then((res) => { if (!cancelled) setEvents(res.data || []); })
      .catch(() => { if (!cancelled) setEvents([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const cells = useMemo(
    () => buildGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const d = new Date(e.start);
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return map;
  }, [events]);

  const monthEvents = useMemo(() => {
    return events
      .filter((e) => {
        const d = new Date(e.start);
        return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear();
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events, cursor]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.end || e.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 8);
  }, [events]);

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const backendOrigin = (process.env.REACT_APP_BACKEND_URL || window.location.origin).replace(/\/$/, '');
  const icsUrl = `${backendOrigin}/api/events/calendar.ics`;
  const webcalUrl = icsUrl.replace(/^https?:/, 'webcal:');
  const googleSubscribeUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(icsUrl)}`;

  const copyWebcal = async () => {
    try {
      await navigator.clipboard.writeText(webcalUrl);
      toast({
        title: 'Calendar link copied',
        description: 'Paste it into Apple Calendar / Outlook → "New Calendar Subscription".',
      });
    } catch {
      toast({ title: 'Copy failed — use the Google button instead', variant: 'destructive' });
    }
  };

  const monthLabel = `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] via-white to-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero */}
        <div className="flex items-start md:items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={22} className="text-[#0f1e42]" />
              <p className="uppercase text-xs tracking-[0.2em] font-bold text-[#0f1e42]">Calusa Calendar</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0f1e42]">
              What's happening at Calusa
            </h1>
            <p className="text-gray-600 mt-1">
              Sync our full event list to your phone — it stays up to date automatically.
            </p>
          </div>

          {/* Subscribe CTAs */}
          <div className="flex flex-wrap gap-2" data-testid="calendar-subscribe-block">
            <a
              href={webcalUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f1e42] text-white font-semibold text-sm hover:bg-[#1a2d5a] shadow"
              data-testid="subscribe-apple-btn"
            >
              <CalendarDays size={16} />
              Add to Apple Calendar
            </a>
            <a
              href={googleSubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0f1e42] border border-[#0f1e42] font-semibold text-sm hover:bg-gray-50 shadow"
              data-testid="subscribe-google-btn"
            >
              <CalendarDays size={16} />
              Add to Google Calendar
            </a>
            <button
              type="button"
              onClick={copyWebcal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-700 border border-gray-300 font-semibold text-sm hover:bg-gray-50"
              data-testid="subscribe-copy-btn"
            >
              <LinkIcon size={16} />
              Copy link
            </button>
            <a
              href={icsUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-700 border border-gray-300 font-semibold text-sm hover:bg-gray-50"
              data-testid="subscribe-download-btn"
            >
              <Download size={16} />
              Download .ics
            </a>
          </div>
        </div>

        {/* Main grid: calendar (2/3) + upcoming list (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 p-4 md:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-2xl font-black text-[#0f1e42]" data-testid="calendar-month-label">
                {monthLabel}
              </h2>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" onClick={goPrev} data-testid="calendar-prev-btn">
                  <ChevronLeft size={18} />
                </Button>
                <Button variant="outline" onClick={goToday} data-testid="calendar-today-btn" className="px-3">
                  <RotateCcw size={14} className="mr-1" /> Today
                </Button>
                <Button size="icon" variant="outline" onClick={goNext} data-testid="calendar-next-btn">
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
              {cells.map((d, i) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                const isToday = sameDay(d, today);
                const dayEvents = eventsByDay.get(d.toDateString()) || [];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => dayEvents[0] && setSelected(dayEvents[0])}
                    className={`relative min-h-[86px] p-1.5 rounded-lg text-left transition-all border
                      ${inMonth ? 'bg-white hover:bg-[#FFF8E7]' : 'bg-gray-50/60 text-gray-400'}
                      ${isToday ? 'ring-2 ring-[#FFD700] border-[#FFD700]' : 'border-gray-100'}
                    `}
                    data-testid={`calendar-cell-${d.toISOString().slice(0, 10)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isToday ? 'text-[#0f1e42]' : ''}`}>
                        {d.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[dayEvents[0].category]?.dot || 'bg-slate-400'}`} />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => {
                        const c = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.OTHER;
                        return (
                          <div
                            key={e.id}
                            className={`truncate text-[10px] leading-tight px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-gray-500 px-1.5">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {loading && <p className="text-sm text-gray-500 text-center mt-4">Loading events…</p>}
            {!loading && monthEvents.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-4" data-testid="calendar-empty-month">
                No events scheduled in {monthLabel}. Check the next month!
              </p>
            )}
          </Card>

          {/* Upcoming list */}
          <Card className="p-4 md:p-6" data-testid="calendar-upcoming">
            <h3 className="text-xl font-black text-[#0f1e42] mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-[#FFD700]" />
              Coming up
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing on the calendar yet.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((e) => {
                  const c = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.OTHER;
                  const d = new Date(e.start);
                  return (
                    <li
                      key={e.id}
                      className={`border-l-4 pl-3 py-2 ${c.border} rounded-r-md hover:bg-gray-50 transition-colors cursor-pointer`}
                      onClick={() => setSelected(e)}
                      data-testid={`upcoming-event-${e.id}`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {!e.all_day && <span>· {formatTime(e.start)}</span>}
                      </div>
                      <p className="font-semibold text-[#0f1e42] leading-tight mt-0.5">{e.title}</p>
                      {e.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {e.location}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </main>

      {/* Event detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          data-testid="event-detail-modal"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[selected.category]?.bg || ''} ${CATEGORY_COLORS[selected.category]?.text || ''}`}>
                  {selected.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
                data-testid="event-detail-close"
              >
                ×
              </button>
            </div>
            <h3 className="text-2xl font-black text-[#0f1e42] mb-2">{selected.title}</h3>
            <div className="space-y-1.5 text-sm text-gray-700 mb-4">
              <p className="flex items-center gap-2">
                <CalendarDays size={14} className="text-gray-500" /> {formatDate(selected.start)}
              </p>
              {!selected.all_day && (
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-500" />
                  {formatTime(selected.start)}{selected.end ? ` – ${formatTime(selected.end)}` : ''}
                </p>
              )}
              {selected.all_day && (
                <p className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                  All-day event
                </p>
              )}
              {selected.location && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-500" /> {selected.location}
                </p>
              )}
            </div>
            {selected.description && (
              <p className="text-gray-700 text-sm whitespace-pre-wrap mb-4">{selected.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <a
                href={`${backendOrigin}/api/events/${selected.id}.ics`}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded bg-[#0f1e42] text-white hover:bg-[#1a2d5a]"
                data-testid="event-add-to-calendar-btn"
              >
                <Download size={14} /> Add to my calendar
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventsPage;
