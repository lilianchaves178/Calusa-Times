import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Pin, PinOff, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const emptyForm = { title: '', subtitle: '', link: '', image_url: '' };

const AdminPhotoOfWeekPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pinned, setPinned] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/photo-of-week/pin');
      if (res.data) {
        setForm({
          title: res.data.title || '',
          subtitle: res.data.subtitle || '',
          link: res.data.link || '',
          image_url: res.data.image_url || '',
        });
        setPinned(true);
      } else {
        setForm(emptyForm);
        setPinned(false);
      }
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

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/photo-of-week/upload-image', fd, {
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

  const save = async () => {
    if (!form.image_url) {
      toast({ title: 'Upload a photo first', variant: 'destructive' });
      return;
    }
    if (!form.title.trim()) {
      toast({ title: 'Give it a title', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.put('/photo-of-week/pin', form);
      setPinned(true);
      toast({ title: 'Pinned!', description: 'This photo now shows on the homepage — no more rotation.' });
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

  const unpin = async () => {
    if (!window.confirm('Unpin this photo? Photo of the Week will go back to auto-rotating recent photos.')) return;
    try {
      await api.delete('/photo-of-week/pin');
      setPinned(false);
      setForm(emptyForm);
      toast({ title: 'Unpinned', description: 'Back to auto-rotating recent photos.' });
    } catch {
      toast({ title: 'Failed to unpin', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0f1e42] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-[#16295c] mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Camera size={24} className="text-[#FFD700]" />
            <h1 className="text-3xl font-bold">Photo of the Week</h1>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Pin one photo to feature on the homepage, instead of auto-rotating recent uploads.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
            pinned ? 'bg-[#FFD700]/20 text-[#8a6d00] border border-[#FFD700]' : 'bg-gray-200 text-gray-600'
          }`}
          data-testid="pin-status-banner"
        >
          {pinned ? <Pin size={16} /> : <PinOff size={16} />}
          {pinned
            ? 'A photo is currently pinned — it\'s the only one showing on the homepage.'
            : 'Nothing pinned right now — the homepage is auto-rotating recent photos from articles, achievements, art, and spotlight.'}
        </div>

        <Card className="p-6">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                {form.image_url ? (
                  <img src={assetUrl(form.image_url)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" />
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-gray-50 border rounded text-sm hover:bg-gray-100">
                <Upload size={14} />
                {uploading ? 'Uploading…' : form.image_url ? 'Change photo' : 'Choose photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadImage(e.target.files[0])}
                  data-testid="photo-of-week-image-input"
                />
              </label>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <Input
              placeholder="e.g., Field Day Champions!"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              data-testid="photo-of-week-title-input"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Caption (optional)</label>
            <Input
              placeholder="e.g., 5th grade sweeps the relay race"
              value={form.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
              data-testid="photo-of-week-subtitle-input"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Link when clicked (optional)</label>
            <Input
              placeholder="e.g., /articles/abc123 or leave blank for homepage"
              value={form.link}
              onChange={(e) => update('link', e.target.value)}
              data-testid="photo-of-week-link-input"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={save}
              disabled={saving}
              className="bg-[#0f1e42] hover:bg-[#16295c] text-white"
              data-testid="save-photo-of-week-btn"
            >
              <Pin size={16} className="mr-2" />
              {saving ? 'Saving…' : pinned ? 'Update Pin' : 'Pin This Photo'}
            </Button>
            {pinned && (
              <Button
                onClick={unpin}
                variant="outline"
                data-testid="unpin-photo-of-week-btn"
              >
                <PinOff size={16} className="mr-2" />
                Unpin
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPhotoOfWeekPage;
