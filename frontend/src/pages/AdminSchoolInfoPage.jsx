import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const AdminSchoolInfoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/school-info');
      setForm({
        ...res.data,
        about_paragraphs: res.data.about_paragraphs || [],
        notable_achievements: res.data.notable_achievements || [],
      });
    } catch {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateListItem = (field, idx, value) => {
    setForm((f) => {
      const copy = [...(f[field] || [])];
      copy[idx] = value;
      return { ...f, [field]: copy };
    });
  };

  const addListItem = (field, value = '') => {
    setForm((f) => ({ ...f, [field]: [...(f[field] || []), value] }));
  };

  const removeListItem = (field, idx) => {
    setForm((f) => {
      const copy = [...(f[field] || [])];
      copy.splice(idx, 1);
      return { ...f, [field]: copy };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/school-info', form);
      toast({ title: 'School info saved' });
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

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/school-info/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update('image_url', res.data.image_url);
      toast({ title: 'Image uploaded' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-cyan-800 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-cyan-900 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">School Info</h1>
          <p className="text-cyan-100 text-sm">Edit what shows up on the About / Info page</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-xl">Basics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="School name"
              value={form.school_name || ''}
              onChange={(e) => update('school_name', e.target.value)}
              data-testid="schoolinfo-name-input"
            />
            <Input
              placeholder="Tagline"
              value={form.tagline || ''}
              onChange={(e) => update('tagline', e.target.value)}
              data-testid="schoolinfo-tagline-input"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              placeholder="Address"
              value={form.address || ''}
              onChange={(e) => update('address', e.target.value)}
              rows={2}
              data-testid="schoolinfo-address-input"
            />
            <Textarea
              placeholder="Hours (e.g., Monday - Friday\n8:00 AM - 3:00 PM)"
              value={form.hours || ''}
              onChange={(e) => update('hours', e.target.value)}
              rows={2}
              data-testid="schoolinfo-hours-input"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Phone"
              value={form.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              data-testid="schoolinfo-phone-input"
            />
            <Input
              placeholder="Email"
              value={form.email || ''}
              onChange={(e) => update('email', e.target.value)}
              data-testid="schoolinfo-email-input"
            />
            <Input
              placeholder="Website URL"
              value={form.website || ''}
              onChange={(e) => update('website', e.target.value)}
              data-testid="schoolinfo-website-input"
            />
          </div>
          <Input
            placeholder="Instagram URL"
            value={form.instagram_url || ''}
            onChange={(e) => update('instagram_url', e.target.value)}
            data-testid="schoolinfo-instagram-input"
          />
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-xl">Hero Image</h2>
          {form.image_url ? (
            <img
              src={assetUrl(form.image_url)}
              alt="Preview"
              className="w-full max-h-56 object-cover rounded-lg border"
              data-testid="schoolinfo-image-preview"
            />
          ) : (
            <div className="h-48 flex items-center justify-center border border-dashed rounded-lg text-gray-400">
              No image yet
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files[0])}
              className="text-sm"
              data-testid="schoolinfo-image-input"
            />
            {uploading && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Upload size={14} className="animate-pulse" /> Uploading…
              </span>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">About paragraphs</h2>
            <Button size="sm" variant="outline" onClick={() => addListItem('about_paragraphs')} data-testid="add-paragraph-btn">
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
          {(form.about_paragraphs || []).map((p, idx) => (
            <div key={idx} className="flex gap-2" data-testid={`about-paragraph-${idx}`}>
              <Textarea
                value={p}
                onChange={(e) => updateListItem('about_paragraphs', idx, e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="destructive"
                onClick={() => removeListItem('about_paragraphs', idx)}
                data-testid={`remove-paragraph-${idx}`}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">Notable highlights</h2>
            <Button size="sm" variant="outline" onClick={() => addListItem('notable_achievements')} data-testid="add-highlight-btn">
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
          {(form.notable_achievements || []).map((p, idx) => (
            <div key={idx} className="flex gap-2" data-testid={`highlight-${idx}`}>
              <Input
                value={p}
                onChange={(e) => updateListItem('notable_achievements', idx, e.target.value)}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="destructive"
                onClick={() => removeListItem('notable_achievements', idx)}
                data-testid={`remove-highlight-${idx}`}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={save}
            disabled={saving}
            className="bg-cyan-700 hover:bg-cyan-800"
            data-testid="save-schoolinfo-btn"
          >
            <Save size={16} className="mr-2" />
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/school-info')} data-testid="view-public-btn">
            View Public Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSchoolInfoPage;
