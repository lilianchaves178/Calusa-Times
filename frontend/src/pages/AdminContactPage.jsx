import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Trash2, CheckCircle, RotateCcw, Reply } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'all', label: 'All' },
];

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return iso; }
};

const AdminContactPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('open');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab === 'open') params.resolved = false;
      if (tab === 'resolved') params.resolved = true;
      const res = await api.get('/contact', { params });
      setList(res.data);
    } catch {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const setResolved = async (msg, resolved) => {
    try {
      await api.put(`/contact/${msg.id}/resolve`, null, { params: { resolved } });
      toast({ title: resolved ? 'Marked resolved' : 'Reopened' });
      load();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contact/${id}`);
      toast({ title: 'Deleted' });
      load();
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const openCount = list.filter((m) => !m.resolved).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0f1e42] text-white shadow-lg">
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
            <Mail size={28} />
            <div>
              <h1 className="text-3xl font-bold">Contact Inbox</h1>
              <p className="text-blue-100 text-sm">Messages sent through the public Contact Us form.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <Button
                key={t.key}
                variant={tab === t.key ? 'default' : 'outline'}
                onClick={() => setTab(t.key)}
                data-testid={`contact-tab-${t.key}`}
              >
                {t.label}
                {t.key === 'open' && openCount > 0 && tab !== 'open' ? ` (${openCount})` : ''}
              </Button>
            ))}
          </div>
          <span className="text-sm text-gray-500" data-testid="contact-count">
            {list.length} {list.length === 1 ? 'message' : 'messages'}
          </span>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : list.length === 0 ? (
          <Card className="p-12 text-center text-gray-500" data-testid="contact-empty">
            {tab === 'open' ? 'Inbox zero! No open messages.' :
             tab === 'resolved' ? 'No resolved messages yet.' :
             'No contact messages yet.'}
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((m) => (
              <Card
                key={m.id}
                className={`p-5 ${m.resolved ? 'opacity-70 bg-gray-50' : ''}`}
                data-testid={`contact-row-${m.id}`}
              >
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#0f1e42] text-lg leading-tight">{m.subject}</h3>
                    <p className="text-sm text-gray-600">
                      From <strong>{m.name}</strong> &lt;
                      <a className="text-blue-700 hover:underline" href={`mailto:${m.email}`}>{m.email}</a>
                      &gt; · {formatDate(m.created_at)}
                    </p>
                    {m.article_title && (
                      <p className="text-xs text-gray-500 mt-0.5">Re: {m.article_title}</p>
                    )}
                  </div>
                  {m.resolved && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wide">
                      Resolved
                    </span>
                  )}
                </div>
                <div className="bg-blue-50 border-l-4 border-[#0f1e42] rounded px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap mb-3">
                  {m.message}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject)}`}
                    className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                    data-testid={`contact-reply-${m.id}`}
                  >
                    <Reply size={14} /> Reply
                  </a>
                  {m.resolved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setResolved(m, false)}
                      data-testid={`contact-reopen-${m.id}`}
                    >
                      <RotateCcw size={14} className="mr-1" /> Reopen
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setResolved(m, true)}
                      data-testid={`contact-resolve-${m.id}`}
                    >
                      <CheckCircle size={14} className="mr-1" /> Mark resolved
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(m.id)}
                    data-testid={`contact-delete-${m.id}`}
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactPage;
