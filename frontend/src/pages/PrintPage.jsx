import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrintableNewspaper from '../components/PrintableNewspaper';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Printer, Calendar, Info, Newspaper } from 'lucide-react';
import api from '../lib/api';
import './AdminPrintPage.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const DEFAULT_MONTH = formatMonthKey(new Date());

const PrintPage = () => {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const autoPrint = qs.get('autoprint') === '1';

  const [monthKey, setMonthKey] = useState(qs.get('month') || DEFAULT_MONTH);
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
    // Public endpoints — already filtered to approved/active items
    Promise.all([
      api.get('/articles').catch(() => ({ data: [] })),
      api.get('/achievements', { params: { limit: 200 } }).catch(() => ({ data: [] })),
    ]).then(([aRes, hRes]) => {
      if (cancelled) return;
      const inMonth = (iso) => {
        if (!iso) return false;
        const d = new Date(iso);
        return d >= monthStart && d <= monthEnd;
      };
      setArticles(
        (aRes.data || [])
          .filter((a) => inMonth(a.date))
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
      setAchievements((hRes.data || []).filter((h) => inMonth(h.created_at || h.date)));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [monthStart, monthEnd]);

  // Auto-trigger print when accessed via the footer "download" link
  useEffect(() => {
    if (!autoPrint || loading) return;
    if (articles.length === 0 && achievements.length === 0) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint, loading, articles.length, achievements.length]);

  const monthLabel = `${MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
  const printableCount = articles.length + achievements.length;
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8 print:hidden">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper size={32} className="text-[#0f1e42]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">Monthly Newspaper</h1>
          </div>
          <p className="text-gray-700 mb-6">
            Pick a month below to read the printable edition — same one-sheet layout we hand out at school. Click
            <strong> Download / Save as PDF</strong> to keep a copy.
          </p>

          <Card className="p-4 mb-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#0f1e42]" />
              <label htmlFor="public-month-picker" className="font-semibold text-sm">Issue month:</label>
              <input
                id="public-month-picker"
                type="month"
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                data-testid="public-print-month-picker"
              />
            </div>
            <div className="text-sm text-gray-600" data-testid="public-print-stats">
              {loading
                ? 'Loading…'
                : `${articles.length} article${articles.length === 1 ? '' : 's'} · ${achievements.length} achievement${achievements.length === 1 ? '' : 's'}`}
            </div>
            <Button
              onClick={handlePrint}
              disabled={loading || printableCount === 0}
              className="bg-[#0f1e42] hover:bg-[#1a2d5a] text-white gap-2 ml-auto"
              data-testid="public-print-btn"
            >
              <Printer size={16} />
              Download / Save as PDF
            </Button>
          </Card>
          <p className="text-xs text-gray-600 flex items-start gap-1.5">
            <Info size={13} className="mt-0.5 flex-shrink-0" />
            Tip: In the print dialog choose <strong>Save as PDF</strong>, set Paper size = <strong>Letter</strong>, and enable <strong>Background graphics</strong> for the best result.
          </p>
        </div>

        {loading ? null : printableCount === 0 ? (
          <div className="max-w-6xl mx-auto px-6 pb-12 print:hidden">
            <Card className="p-12 text-center text-gray-500" data-testid="public-print-empty">
              No published articles or achievements for {monthLabel} yet. Try another month!
            </Card>
          </div>
        ) : (
          <PrintableNewspaper
            monthLabel={monthLabel}
            articles={articles}
            achievements={achievements}
          />
        )}
      </main>

      <div className="print:hidden mt-8">
        <Footer />
      </div>
    </div>
  );
};

export default PrintPage;
