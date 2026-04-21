import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const CATEGORIES = ['news', 'arts', 'opinion', 'sports', 'poetry', 'science', 'quick thought'];

const defaultState = {
  category: 'news',
  title: '',
  description: '',
  content: '',
  author: '',
  grade: '',
  image_url: '',
  featured: false,
  comments_enabled: true,
  approved: false,
};

const AdminArticleEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { toast } = useToast();
  const [form, setForm] = useState(defaultState);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api
      .get(`/articles/${id}`)
      .then((res) => setForm({ ...defaultState, ...res.data }))
      .catch(() => toast({ title: 'Failed to load article', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const endpoint = isNew ? '/articles/upload-image' : `/articles/${id}/upload-image`;
      const res = await api.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update('image_url', res.data.image_url);
      toast({ title: 'Image uploaded' });
    } catch (e) {
      toast({ title: 'Image upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const { featured, comments_enabled, approved, ...createPayload } = form;
        // Admin creating -> auto-publish immediately
        const res = await api.post('/articles', { ...createPayload, featured, comments_enabled });
        if (!res.data.approved) {
          await api.put(`/articles/${res.data.id}/approve`);
        }
        toast({ title: 'Article created' });
        navigate(`/admin/articles/${res.data.id}/edit`, { replace: true });
      } else {
        await api.put(`/articles/${id}`, form);
        toast({ title: 'Article saved' });
      }
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/articles')}
            variant="outline"
            className="text-white border-white hover:bg-blue-800 mb-4"
            data-testid="back-to-articles-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Articles
          </Button>
          <h1 className="text-3xl font-bold">{isNew ? 'Create Article' : 'Edit Article'}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  data-testid="article-category-select"
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Author</label>
                <Input
                  value={form.author}
                  onChange={(e) => update('author', e.target.value)}
                  placeholder="Student name"
                  required
                  data-testid="article-author-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Grade (optional)</label>
              <Input
                value={form.grade || ''}
                onChange={(e) => update('grade', e.target.value)}
                placeholder="e.g., 5th Grade"
                data-testid="article-grade-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <Input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                data-testid="article-title-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Short Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                required
                data-testid="article-description-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Full Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
                rows={10}
                required
                data-testid="article-content-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Article Image</label>
              {form.image_url ? (
                <div className="mb-3">
                  <img
                    src={assetUrl(form.image_url)}
                    alt="preview"
                    className="rounded-lg max-h-64 border"
                    data-testid="article-image-preview"
                  />
                </div>
              ) : (
                <div className="mb-3 flex items-center justify-center h-40 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="block text-sm"
                  data-testid="article-image-input"
                />
                {uploading && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Upload size={14} className="animate-pulse" /> Uploading…
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.approved}
                  onChange={(e) => update('approved', e.target.checked)}
                  data-testid="article-approved-toggle"
                  disabled={isNew}
                />
                <span className="font-semibold">
                  Published {isNew && <span className="text-xs text-gray-500">(auto-publishes on create)</span>}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.featured}
                  onChange={(e) => update('featured', e.target.checked)}
                  data-testid="article-featured-toggle"
                />
                <span className="font-semibold">Featured on homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.comments_enabled}
                  onChange={(e) => update('comments_enabled', e.target.checked)}
                  data-testid="article-comments-toggle"
                />
                <span className="font-semibold">Allow comments</span>
              </label>
            </div>
          </Card>

          <div className="mt-6 flex gap-3">
            <Button
              type="submit"
              className="bg-blue-700 text-white hover:bg-blue-800"
              disabled={saving}
              data-testid="save-article-btn"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving…' : isNew ? 'Create Article' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/articles')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminArticleEditPage;
