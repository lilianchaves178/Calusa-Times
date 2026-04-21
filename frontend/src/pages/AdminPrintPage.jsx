import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Calendar, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import PrintableNewspaper from '../components/PrintableNewspaper';
import api from '../lib/api';
import './AdminPrintPage.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const DEFAULT_MONTH = formatMonthKey(new Date());

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
      setArticles(
        (aRes.data || [])
          .filter((a) => a.approved && inMonth(a.date))
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
      setAchievements(
        (hRes.data || []).filter((h) => h.is_active && inMonth(h.created_at || h.date)),
      );
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [monthStart, monthEnd]);

  const monthLabel = `${MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
  const printableCount = articles.length + achievements.length;
  const handlePrint = () => window.print();

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
        <PrintableNewspaper
          monthLabel={monthLabel}
          articles={articles}
          achievements={achievements}
        />
      )}
    </div>
  );
};

export default AdminPrintPage;
