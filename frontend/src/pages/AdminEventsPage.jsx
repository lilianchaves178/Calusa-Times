import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Edit, Save, X, CalendarDays, ToggleLeft, ToggleRight, MapPin,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const CATEGORIES = [
  'FIELD_TRIP', 'HOLIDAY', 'ASSEMBLY', 'PARENT', 'SPORTS',
  'ARTS', 'FUNDRAISER', 'ACADEMIC', 'OTHER',
];

const emptyEvent = {
  title: '',
  description: '',
  location: '',
  category: 'OTHER',
  start: '',
  end: '',
  all_day: false,
  is_active: true,
};

const toInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatWhen = (e) => {
  const d = new Date(e.start);
  const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (e.all_day) return `${day} · All day`;
  const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${t}`;
};

const AdminEventsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', { params: { active_only: false } });
      setEvents(res.data);
    } catch {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    setEditing('new');
    setForm({ ...emptyEvent, start: toInput(now) });
  };

  const openEdit = (e) => {
    setEditing(e.id);
    setForm({
      title: e.title || '',
      description: e.description || '',
      location: e.location || '',
      category: e.category || 'OTHER',
      start: toInput(e.start),
      end: toInput(e.end),
      all_day: !!e.all_day,
      is_active: !!e.is_active,
    });
  };

  const close = () => { setEditing(null); setForm(emptyEvent); };

  const save = async () => {
    if (!form.title || !form.start) {
      toast({ title: 'Title and start date are required', variant: 'destructive' });
      return;
    }
    const payload = {
      title: form.title,
      description: form.description || null,
      location: form.location || null,
      category: form.category,
      start: new Date(form.start).toISOString(),
      end: form.end ? new Date(form.end).toISOString() : null,
      all_day: form.all_day,
      is_active: form.is_active,
    };
    try {
      if (editing === 'new') {
        await api.post('/events', payload);
        toast({ title: 'Event added' });
      } else {
        await api.put(`/events/${editing}`, payload);
        toast({ title: 'Saved' });
      }
      close();
      load();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e?.response?.data?.detail || '',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (e) => {
    try {
      await api.put(`/events/${e.id}`, { is_active: !e.is_active });
      load();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast({ title: 'Deleted' });
      load();
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays size={28} />
              <div>
                <h1 className="text-3xl font-bold">Events Calendar</h1>
                <p className="text-blue-100 text-sm">
                  Anything you add here appears on the public calendar and the ticker banner.
                </p>
              </div>
            </div>
            <Button
              onClick={openNew}
              className="bg-yellow-400 text-[#0f1e42] hover:bg-yellow-500 font-semibold"
              data-testid="add-event-btn"
            >
              <Plus size={16} className="mr-1" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {editing && (
          <Card className="p-6 mb-6 border-2 border-[#FFD700]" data-testid="event-edit-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0f1e42]">
                {editing === 'new' ? 'New Event' : 'Edit Event'}
              </h2>
              <Button variant="outline" size="sm" onClick={close}>
                <X size={16} />
              </Button>
            </div>

            <Input
              placeholder="Event title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mb-3"
              data-testid="event-title-input"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  data-testid="event-category-select"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                data-testid="event-location-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Start</label>
                <Input
                  type="datetime-local"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  data-testid="event-start-input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">End (optional)</label>
                <Input
                  type="datetime-local"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  data-testid="event-end-input"
                />
              </div>
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mb-3"
              data-testid="event-description-input"
            />
            <div className="flex items-center gap-6 mb-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.all_day}
                  onChange={(e) => setForm({ ...form, all_day: e.target.checked })}
                  data-testid="event-all-day-checkbox"
                />
                All-day
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  data-testid="event-active-checkbox"
                />
                Active (show on calendar)
              </label>
            </div>
            <Button
              onClick={save}
              className="bg-[#0f1e42] hover:bg-[#1a2d5a] text-white"
              data-testid="event-save-btn"
            >
              <Save size={16} className="mr-1" /> Save
            </Button>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center text-gray-500" data-testid="events-empty">
            No events yet. Click <strong>New Event</strong> to add your first one.
          </Card>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <Card
                key={e.id}
                className={`p-4 flex items-center gap-4 ${e.is_active ? '' : 'opacity-60'}`}
                data-testid={`event-row-${e.id}`}
              >
                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={22} className="text-[#0f1e42]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[#0f1e42] leading-tight truncate">{e.title}</h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase tracking-wider">
                      {e.category.replace('_', ' ')}
                    </span>
                    {!e.is_active && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatWhen(e)}
                    {e.location && (
                      <>
                        <span className="mx-1.5">·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin size={10} /> {e.location}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(e)} title="Toggle visibility">
                  {e.is_active ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} className="text-gray-400" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(e.id)} className="text-red-600 hover:bg-red-50">
                  <Trash2 size={14} />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventsPage;
