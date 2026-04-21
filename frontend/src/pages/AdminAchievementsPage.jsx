import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Save, X, Trophy, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';
import PexelsImagePicker from '../components/PexelsImagePicker';

const CATEGORIES = ['ACADEMIC', 'SPORTS', 'LEADERSHIP', 'ARTS', 'ATTENDANCE', 'STEM'];
const emptyAchievement = {
  title: '',
  recipient: '',
  category: 'ACADEMIC',
  description: '',
  image_url: '',
  order: 0,
  is_active: true,
};

const categoryColors = {
  ACADEMIC: 'bg-blue-100 text-blue-700',
  SPORTS: 'bg-green-100 text-green-700',
  LEADERSHIP: 'bg-purple-100 text-purple-700',
  ARTS: 'bg-pink-100 text-pink-700',
  ATTENDANCE: 'bg-yellow-100 text-yellow-700',
  STEM: 'bg-indigo-100 text-indigo-700',
};

const AdminAchievementsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAchievement);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/achievements', {
        params: { active_only: false, limit: 500 },
      });
      setList(res.data);
    } catch {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing('new');
    setForm({ ...emptyAchievement, order: list.length + 1 });
  };

  const openEdit = (item) => {
    setEditing(item.id);
    setForm({ ...item });
  };

  const close = () => {
    setEditing(null);
    setForm(emptyAchievement);
  };

  const save = async () => {
    try {
      if (editing === 'new') {
        const res = await api.post('/achievements', form);
        const newId = res.data.id;
        if (form._pendingFile) {
          const fd = new FormData();
          fd.append('file', form._pendingFile);
          await api.post(`/achievements/${newId}/upload-image`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        toast({ title: 'Achievement added' });
      } else {
        await api.put(`/achievements/${editing}`, {
          title: form.title,
          recipient: form.recipient,
          category: form.category,
          description: form.description,
          image_url: form.image_url || null,
          order: form.order,
          is_active: form.is_active,
        });
        if (form._pendingFile) {
          const fd = new FormData();
          fd.append('file', form._pendingFile);
          await api.post(`/achievements/${editing}/upload-image`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
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

  const remove = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/achievements/${id}`);
      load();
      toast({ title: 'Deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const toggle = async (item) => {
    try {
      await api.put(`/achievements/${item.id}`, { is_active: !item.is_active });
      load();
    } catch {
      toast({ title: 'Toggle failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-emerald-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-emerald-900 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-emerald-100 text-sm">Add awards, honors, and recognitions for the homepage + achievements page</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" data-testid="achievements-count">Achievements ({list.length})</h2>
          <Button
            onClick={openNew}
            className="bg-emerald-700 hover:bg-emerald-800"
            data-testid="add-achievement-btn"
          >
            <Plus size={16} className="mr-2" />
            Add Achievement
          </Button>
        </div>

        {editing && (
          <Card className="p-6 mb-6 border-2 border-emerald-400">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {editing === 'new' ? 'New Achievement' : 'Edit Achievement'}
              </h3>
              <Button variant="ghost" size="icon" onClick={close}>
                <X size={20} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                placeholder="Title (e.g., State Spelling Bee Champion)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-testid="achievement-title-input"
              />
              <Input
                placeholder="Recipient (student name or team)"
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                data-testid="achievement-recipient-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                data-testid="achievement-category-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Display order"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                data-testid="achievement-order-input"
              />
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mb-4"
              data-testid="achievement-description-input"
            />

            <div className="mb-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
              <label className="block text-sm font-semibold mb-2">Picture (optional)</label>
              {(form.image_url || form._pendingPreview) && (
                <div className="relative inline-block mb-3">
                  <img
                    src={form._pendingPreview || assetUrl(form.image_url)}
                    alt="Achievement preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image_url: '', _pendingFile: null, _pendingPreview: '' }))}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm leading-none hover:bg-red-600"
                    aria-label="Remove image"
                    data-testid="achievement-remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setForm((f) => ({
                      ...f,
                      _pendingFile: file,
                      _pendingPreview: URL.createObjectURL(file),
                      image_url: '',
                    }));
                  }}
                  className="text-sm"
                  data-testid="achievement-image-input"
                />
                <span className="text-xs text-gray-500">or</span>
                <PexelsImagePicker
                  target="achievements"
                  onImported={(url) =>
                    setForm((f) => ({ ...f, image_url: url, _pendingFile: null, _pendingPreview: '' }))
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a photo or pick a free image from Pexels. If left empty, a trophy icon is shown.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active (show on site)
            </label>
            <Button onClick={save} className="bg-emerald-700 hover:bg-emerald-800" data-testid="save-achievement-btn">
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : list.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            No achievements yet — add the first one!
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((item) => (
              <Card
                key={item.id}
                className={`p-4 flex items-start gap-4 ${!item.is_active ? 'opacity-60' : ''}`}
                data-testid={`achievement-row-${item.id}`}
              >
                {item.image_url ? (
                  <img
                    src={assetUrl(item.image_url)}
                    alt={item.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy size={24} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                        categoryColors[item.category] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-500">order: {item.order ?? 0}</span>
                    {!item.is_active && (
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded">INACTIVE</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.recipient}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(item)}
                    data-testid={`edit-achievement-${item.id}`}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggle(item)}
                    data-testid={`toggle-achievement-${item.id}`}
                  >
                    {item.is_active ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(item.id)}
                    data-testid={`delete-achievement-${item.id}`}
                  >
                    <Trash2 size={14} />
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

export default AdminAchievementsPage;
