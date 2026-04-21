import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Edit, Save, X, LinkIcon, ToggleLeft, ToggleRight, Users,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const CATEGORIES = ['PTA', 'INFO', 'CHAT', 'FORMS', 'VOLUNTEER', 'OTHER'];

const emptyResource = {
  title: '',
  description: '',
  url: '',
  category: 'PTA',
  order: 0,
  is_active: true,
};

const AdminParentResourcesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resources, setResources] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyResource);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent-resources', { params: { active_only: false } });
      setResources(res.data);
    } catch {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing('new');
    setForm({ ...emptyResource });
  };

  const openEdit = (r) => {
    setEditing(r.id);
    setForm({
      title: r.title || '',
      description: r.description || '',
      url: r.url || '',
      category: r.category || 'OTHER',
      order: r.order || 0,
      is_active: !!r.is_active,
    });
  };

  const close = () => { setEditing(null); setForm(emptyResource); };

  const save = async () => {
    if (!form.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    try {
      if (editing === 'new') {
        await api.post('/parent-resources', form);
        toast({ title: 'Resource added' });
      } else {
        await api.put(`/parent-resources/${editing}`, form);
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

  const toggleActive = async (r) => {
    try {
      await api.put(`/parent-resources/${r.id}`, { is_active: !r.is_active });
      load();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/parent-resources/${id}`);
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
              <Users size={28} />
              <div>
                <h1 className="text-3xl font-bold">Parent Resources</h1>
                <p className="text-blue-100 text-sm">
                  PTA info, forms, group chats, portal links — everything parents need in one place.
                </p>
              </div>
            </div>
            <Button
              onClick={openNew}
              className="bg-yellow-400 text-[#0f1e42] hover:bg-yellow-500 font-semibold"
              data-testid="add-resource-btn"
            >
              <Plus size={16} className="mr-1" />
              New Resource
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {editing && (
          <Card className="p-6 mb-6 border-2 border-[#FFD700]" data-testid="resource-edit-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0f1e42]">
                {editing === 'new' ? 'New Resource' : 'Edit Resource'}
              </h2>
              <Button variant="outline" size="sm" onClick={close}>
                <X size={16} />
              </Button>
            </div>

            <Input
              placeholder="Resource title (e.g. Calusa PTA Meeting Notes)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mb-3"
              data-testid="resource-title-input"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  data-testid="resource-category-select"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Display order</label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                  data-testid="resource-order-input"
                />
              </div>
            </div>
            <Input
              placeholder="URL (e.g. https://chat.whatsapp.com/... or https://calusaschool.org/pta)"
              value={form.url || ''}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="mb-3"
              data-testid="resource-url-input"
            />
            <Textarea
              placeholder="Short description (what's this resource for?)"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mb-3"
              data-testid="resource-description-input"
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                data-testid="resource-active-checkbox"
              />
              Active (visible on the public Info page)
            </label>
            <Button
              onClick={save}
              className="bg-[#0f1e42] hover:bg-[#1a2d5a] text-white"
              data-testid="resource-save-btn"
            >
              <Save size={16} className="mr-1" /> Save
            </Button>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : resources.length === 0 ? (
          <Card className="p-12 text-center text-gray-500" data-testid="resources-empty">
            No parent resources yet. Click <strong>New Resource</strong> to add the first one.
          </Card>
        ) : (
          <div className="space-y-2">
            {resources.map((r) => (
              <Card
                key={r.id}
                className={`p-4 flex items-center gap-4 ${r.is_active ? '' : 'opacity-60'}`}
                data-testid={`resource-row-${r.id}`}
              >
                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={22} className="text-[#0f1e42]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[#0f1e42] leading-tight truncate">{r.title}</h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase tracking-wider">
                      {r.category}
                    </span>
                    {!r.is_active && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">
                        Hidden
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{r.description}</p>
                  )}
                  {r.url && (
                    <p className="text-xs text-blue-700 mt-0.5 truncate flex items-center gap-1">
                      <LinkIcon size={10} /> {r.url}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(r)} title="Toggle visibility">
                  {r.is_active ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} className="text-gray-400" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-red-600 hover:bg-red-50">
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

export default AdminParentResourcesPage;
