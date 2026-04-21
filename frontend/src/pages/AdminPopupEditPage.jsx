import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const TYPES = ['info', 'warning', 'success', 'announcement'];

const defaultState = {
  title: '',
  message: '',
  type: 'announcement',
  is_active: true,
  show_once: false,
  expires_at: '',
};

const AdminPopupEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { toast } = useToast();
  const [form, setForm] = useState(defaultState);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api
      .get('/popups/all')
      .then((res) => {
        const p = res.data.find((x) => x.id === id);
        if (p) {
          setForm({
            ...defaultState,
            ...p,
            expires_at: p.expires_at ? p.expires_at.slice(0, 16) : '',
          });
        } else toast({ title: 'Popup not found', variant: 'destructive' });
      })
      .catch(() => toast({ title: 'Failed to load', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.expires_at) {
        payload.expires_at = null;
      } else {
        payload.expires_at = new Date(payload.expires_at).toISOString();
      }
      if (isNew) {
        const { is_active, ...createPayload } = payload;
        await api.post('/popups', createPayload);
        toast({ title: 'Popup created' });
      } else {
        await api.put(`/popups/${id}`, payload);
        toast({ title: 'Popup saved' });
      }
      navigate('/admin/popups');
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err?.response?.data?.detail || '',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-red-900 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/popups')}
            variant="outline"
            className="text-white border-white hover:bg-red-800 mb-4"
            data-testid="back-to-popups-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Popups
          </Button>
          <h1 className="text-3xl font-bold">{isNew ? 'Create Popup' : 'Edit Popup'}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <Input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                data-testid="popup-title-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Message</label>
              <Textarea
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                rows={4}
                required
                data-testid="popup-message-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Type</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                data-testid="popup-type-select"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Expires At (optional)</label>
              <Input
                type="datetime-local"
                value={form.expires_at || ''}
                onChange={(e) => update('expires_at', e.target.value)}
                data-testid="popup-expires-input"
              />
            </div>
            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                  data-testid="popup-active-toggle"
                />
                <span className="font-semibold">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.show_once}
                  onChange={(e) => update('show_once', e.target.checked)}
                  data-testid="popup-show-once-toggle"
                />
                <span className="font-semibold">Show once per visitor</span>
              </label>
            </div>
          </Card>
          <div className="mt-6 flex gap-3">
            <Button
              type="submit"
              className="bg-red-700 text-white hover:bg-red-800"
              disabled={saving}
              data-testid="save-popup-btn"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving…' : isNew ? 'Create Popup' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/popups')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPopupEditPage;
