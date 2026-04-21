import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Users, MessagesSquare, FileText, HeartHandshake, BookOpen, Info, ExternalLink, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';
import PexelsImagePicker from '../components/PexelsImagePicker';

const CATEGORIES = [
  { key: 'PTA', Icon: HeartHandshake, tint: 'bg-pink-100 text-pink-800 border-pink-300' },
  { key: 'INFO', Icon: BookOpen, tint: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'CHAT', Icon: MessagesSquare, tint: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { key: 'FORMS', Icon: FileText, tint: 'bg-amber-100 text-amber-800 border-amber-300' },
  { key: 'VOLUNTEER', Icon: Users, tint: 'bg-violet-100 text-violet-800 border-violet-300' },
  { key: 'OTHER', Icon: Info, tint: 'bg-slate-100 text-slate-800 border-slate-300' },
];

const AdminParentResourcesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pages, setPages] = useState({});
  const [active, setActive] = useState('PTA');
  const [form, setForm] = useState({ title: '', subtitle: '', body: '', hero_image_url: '', is_active: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent-resource-pages', { params: { active_only: false } });
      const map = {};
      (res.data || []).forEach((p) => { map[p.category] = p; });
      setPages(map);
      const first = map[active] || map.PTA;
      if (first) hydrate(first);
    } catch {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const hydrate = (p) => {
    setForm({
      title: p.title || '',
      subtitle: p.subtitle || '',
      body: p.body || '',
      hero_image_url: p.hero_image_url || '',
      is_active: p.is_active !== false,
    });
  };

  useEffect(() => { loadAll(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const switchCategory = (cat) => {
    setActive(cat);
    if (pages[cat]) hydrate(pages[cat]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/parent-resource-pages/${active}`, form);
      setPages((p) => ({ ...p, [active]: res.data }));
      toast({ title: 'Saved' });
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e?.response?.data?.detail || '',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (fileOrNull) => {
    if (!fileOrNull) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', fileOrNull);
      const res = await api.post(`/parent-resource-pages/${active}/upload-hero`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, hero_image_url: res.data.hero_image_url }));
      toast({ title: 'Image uploaded' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const activeMeta = CATEGORIES.find((c) => c.key === active) || CATEGORIES[0];
  const ActiveIcon = activeMeta.Icon;

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
            <Users size={28} />
            <div>
              <h1 className="text-3xl font-bold">Parent Resources</h1>
              <p className="text-blue-100 text-sm">
                Six fully-editable pages — one per category. Click a tab below to edit.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6" data-testid="parent-resource-tabs">
          {CATEGORIES.map((c) => {
            const Icon = c.Icon;
            const isActive = c.key === active;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => switchCategory(c.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  isActive
                    ? 'bg-[#0f1e42] text-white border-[#0f1e42] shadow-md'
                    : `${c.tint} hover:-translate-y-0.5`
                }`}
                data-testid={`tab-${c.key}`}
              >
                <Icon size={14} />
                {c.key}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : (
          <Card className="p-6 border-2 border-[#FFD700]" data-testid="page-edit-card">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border ${activeMeta.tint}`}>
                <ActiveIcon size={11} />
                {active}
              </span>
              <a
                href={`/parent-resources/${active.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0f1e42]"
                data-testid="preview-public-page-link"
              >
                <ExternalLink size={12} /> Preview public page
              </a>
            </div>

            <label className="block text-sm font-semibold mb-1">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mb-3"
              data-testid="page-title-input"
            />
            <label className="block text-sm font-semibold mb-1">Subtitle (optional)</label>
            <Input
              value={form.subtitle || ''}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="mb-4"
              data-testid="page-subtitle-input"
            />

            {/* Hero image */}
            <label className="block text-sm font-semibold mb-1">Hero image (optional)</label>
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-4">
              {form.hero_image_url && (
                <div className="relative inline-block mb-3">
                  <img
                    src={assetUrl(form.hero_image_url)}
                    alt="Hero preview"
                    className="w-64 max-h-40 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, hero_image_url: '' }))}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm leading-none hover:bg-red-600"
                    aria-label="Remove hero image"
                    data-testid="remove-hero-btn"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onUpload(e.target.files?.[0] || null)}
                  className="text-sm"
                  data-testid="page-hero-input"
                />
                <span className="text-xs text-gray-500">or</span>
                <PexelsImagePicker
                  target="parent-resources"
                  onImported={(url) => setForm((f) => ({ ...f, hero_image_url: url }))}
                />
                {uploading && <span className="text-xs text-gray-500">Uploading…</span>}
              </div>
              {!form.hero_image_url && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <ImageIcon size={12} />
                  No image set — a colored gradient with the category icon will be shown on the public page.
                </p>
              )}
            </div>

            {/* Body */}
            <label className="block text-sm font-semibold mb-1">Article body</label>
            <p className="text-xs text-gray-500 mb-2">
              Write in plain text. Use <code>**bold**</code>, <code>- bullets</code>, and{' '}
              <code>[link text](https://url)</code> for formatting. Put a blank line between paragraphs.
              A line that's entirely <code>**bold**</code> is rendered as a heading.
            </p>
            <Textarea
              rows={16}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="mb-4 font-mono text-sm"
              data-testid="page-body-input"
            />

            <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                data-testid="page-active-checkbox"
              />
              Active (show this category on the public Info page)
            </label>

            <Button
              onClick={save}
              disabled={saving}
              className="bg-[#0f1e42] hover:bg-[#1a2d5a] text-white"
              data-testid="page-save-btn"
            >
              <Save size={16} className="mr-1" />
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminParentResourcesPage;
