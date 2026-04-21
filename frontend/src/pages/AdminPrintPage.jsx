import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Calendar, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import api, { assetUrl } from '../lib/api';
import './AdminPrintPage.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const today = new Date();
const DEFAULT_MONTH = formatMonthKey(today);

const AdminPrintPage = () => {
  const navigate = useNavigate();
  const [monthKey, setMonthKey] = useState(DEFAULT_MONTH);
  const [articles, setArticles] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthStart = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }, [monthKey]);

  const monthEnd = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m, 0, 23, 59, 59);
  }, [monthKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get('/articles/admin/all').catch(() => ({ data: [] })),
      api.get('/achievements', { params: { active_only: false, limit: 500 } }).catch(() => ({ data: [] })),
    ]).then(([aRes, hRes]) => {
      if (cancelled) return;
      const inMonth = (iso) => {
        if (!iso) return false;
        const d = new Date(iso);
        return d >= monthStart && d <= monthEnd;
      };
      const monthArticles = (aRes.data || [])
        .filter((a) => a.approved && inMonth(a.date))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      const monthAch = (hRes.data || [])
        .filter((h) => h.is_active && inMonth(h.created_at || h.date));
      setArticles(monthArticles);
      setAchievements(monthAch);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [monthStart, monthEnd]);

  const monthLabel = `${MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}`;

  const frontArticles = articles.slice(0, 4);
  const backArticles = articles.slice(4, 10);

  const leadArticle = frontArticles[0];
  const frontSecondary = frontArticles.slice(1);

  const truncate = (s = '', n = 240) => {
    const t = (s || '').replace(/\s+/g, ' ').trim();
    if (t.length <= n) return t;
    return t.slice(0, n).replace(/\s+\S*$/, '') + '…';
  };

  const handlePrint = () => window.print();

  const printableCount = articles.length + achievements.length;

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="bg-[#0f1e42] text-white shadow-lg print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-blue-900 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Printer size={28} />
            <div>
              <h1 className="text-3xl font-bold">Printable Edition</h1>
              <p className="text-blue-100 text-sm">
                Pick a month, preview the two-page layout, then print or save as PDF.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 print:hidden">
        <Card className="p-4 mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#0f1e42]" />
            <label htmlFor="month-picker" className="font-semibold text-sm">Issue month:</label>
            <input
              id="month-picker"
              type="month"
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              data-testid="print-month-picker"
            />
          </div>
          <div className="text-sm text-gray-600" data-testid="print-stats">
            {loading
              ? 'Loading…'
              : `${articles.length} article${articles.length === 1 ? '' : 's'} · ${achievements.length} achievement${achievements.length === 1 ? '' : 's'}`}
          </div>
          <Button
            onClick={handlePrint}
            disabled={loading || printableCount === 0}
            className="bg-[#0f1e42] hover:bg-[#1a2d5a] text-white gap-2 ml-auto"
            data-testid="print-btn"
          >
            <Printer size={16} />
            Print / Save as PDF
          </Button>
        </Card>
        <p className="text-xs text-gray-600 flex items-start gap-1.5 mb-2">
          <Info size={13} className="mt-0.5 flex-shrink-0" />
          Tip: In your browser's print dialog set <strong>Paper size = Letter</strong>, <strong>Margins = Default</strong>, and enable <strong>Background graphics</strong> for the best result.
        </p>
      </div>

      {loading ? null : printableCount === 0 ? (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <Card className="p-12 text-center text-gray-500" data-testid="print-empty">
            No approved articles or achievements dated in {monthLabel}. Try another month.
          </Card>
        </div>
      ) : (
        <div className="print-sheets">
          {/* =========== FRONT PAGE =========== */}
          <section className="print-sheet" data-testid="print-sheet-front">
            <header className="paper-masthead">
              <div className="paper-masthead-row">
                <span>Vol. 7</span>
                <span>{monthLabel}</span>
                <span>Est. 2019</span>
              </div>
              <h1 className="paper-title">The Calusa Times</h1>
              <p className="paper-tagline">Calusa Elementary School's Student Gazette</p>
              <div className="paper-masthead-rule" />
            </header>

            {leadArticle && (
              <article className="paper-lead" data-testid="print-lead-article">
                <div className="paper-kicker">{(leadArticle.category || 'news').toUpperCase()}</div>
                <h2 className="paper-lead-title">{leadArticle.title}</h2>
                <p className="paper-byline">
                  By {leadArticle.author}{leadArticle.grade ? `, ${leadArticle.grade}` : ''}
                </p>
                {leadArticle.image_url && (
                  <img
                    src={assetUrl(leadArticle.image_url)}
                    alt={leadArticle.title}
                    className="paper-lead-image"
                  />
                )}
                <p className="paper-lead-body">
                  {truncate(leadArticle.description + ' ' + (leadArticle.content || ''), 520)}
                </p>
              </article>
            )}

            {frontSecondary.length > 0 && (
              <div className="paper-grid">
                {frontSecondary.map((a) => (
                  <article className="paper-column-story" key={a.id}>
                    <div className="paper-kicker">{(a.category || 'news').toUpperCase()}</div>
                    <h3 className="paper-story-title">{a.title}</h3>
                    <p className="paper-byline">By {a.author}</p>
                    {a.image_url && (
                      <img
                        src={assetUrl(a.image_url)}
                        alt={a.title}
                        className="paper-story-image"
                      />
                    )}
                    <p className="paper-story-body">{truncate(a.description, 220)}</p>
                  </article>
                ))}
              </div>
            )}

            <footer className="paper-footer">
              <span>The Calusa Times · {monthLabel}</span>
              <span>calusakidnews · Page 1</span>
            </footer>
          </section>

          {/* =========== BACK PAGE =========== */}
          <section className="print-sheet" data-testid="print-sheet-back">
            <header className="paper-masthead-mini">
              <h2>The Calusa Times · {monthLabel}</h2>
              <span>Continued</span>
            </header>

            {backArticles.length > 0 && (
              <div className="paper-grid">
                {backArticles.map((a) => (
                  <article className="paper-column-story" key={a.id}>
                    <div className="paper-kicker">{(a.category || 'news').toUpperCase()}</div>
                    <h3 className="paper-story-title">{a.title}</h3>
                    <p className="paper-byline">By {a.author}</p>
                    {a.image_url && (
                      <img
                        src={assetUrl(a.image_url)}
                        alt={a.title}
                        className="paper-story-image"
                      />
                    )}
                    <p className="paper-story-body">{truncate(a.description, 220)}</p>
                  </article>
                ))}
              </div>
            )}

            {achievements.length > 0 && (
              <section className="paper-achievements">
                <h3 className="paper-section-heading">🏆 Achievements of the Month</h3>
                <ul className="paper-achievements-list">
                  {achievements.slice(0, 10).map((h) => (
                    <li key={h.id}>
                      <strong>{h.title}</strong> — {h.recipient}
                      <span className="paper-chip">{h.category}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="paper-footer">
              <span>Written by Calusa Students · Student-powered since 2019</span>
              <span>Page 2</span>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminPrintPage;
