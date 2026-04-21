import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const TIERS = ['platinum', 'gold', 'silver', 'bronze'];

const defaultState = {
  name: '',
  tier: 'gold',
  website_url: '',
  description: '',
  is_active: true,
  logo_url: '',
};

const AdminSponsorEditPage = () => {
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
      .get('/sponsors', { params: { active_only: false } })
      .then((res) => {
        const sponsor = res.data.find((s) => s.id === id);
        if (sponsor) setForm({ ...defaultState, ...sponsor });
        else toast({ title: 'Sponsor not found', variant: 'destructive' });
      })
      .catch(() => toast({ title: 'Failed to load sponsor', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogoUpload = async (file, sponsorId) => {
    if (!file || !sponsorId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/sponsors/${sponsorId}/upload-logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update('logo_url', res.data.logo_url);
      toast({ title: 'Logo uploaded' });
    } catch (e) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const { is_active, logo_url, ...payload } = form;
        const res = await api.post('/sponsors', payload);
        toast({ title: 'Sponsor created' });
        navigate(`/admin/sponsors/${res.data.id}/edit`, { replace: true });
      } else {
        await api.put(`/sponsors/${id}`, form);
        toast({ title: 'Sponsor saved' });
      }
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
      <div className="bg-yellow-900 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/sponsors')}
            variant="outline"
            className="text-white border-white hover:bg-yellow-800 mb-4"
            data-testid="back-to-sponsors-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Sponsors
          </Button>
          <h1 className="text-3xl font-bold">{isNew ? 'Add Sponsor' : 'Edit Sponsor'}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Sponsor Name</label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
                data-testid="sponsor-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Tier</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={form.tier}
                onChange={(e) => update('tier', e.target.value)}
                data-testid="sponsor-tier-select"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Website URL</label>
              <Input
                value={form.website_url || ''}
                onChange={(e) => update('website_url', e.target.value)}
                placeholder="https://example.com"
                data-testid="sponsor-website-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (appears on hover on the public Sponsors page)
                </span>
              </label>
              <Textarea
                value={form.description || ''}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                placeholder="A short blurb parents will see when they hover on your logo — 1–2 sentences."
                data-testid="sponsor-description-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Logo</label>
              {form.logo_url ? (
                <img
                  src={assetUrl(form.logo_url)}
                  alt="logo"
                  className="h-32 object-contain border rounded-lg mb-3 bg-white p-2"
                  data-testid="sponsor-logo-preview"
                />
              ) : (
                <div className="mb-3 flex items-center justify-center h-32 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
              {!isNew ? (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e.target.files[0], id)}
                    data-testid="sponsor-logo-input"
                  />
                  {uploading && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Upload size={14} className="animate-pulse" /> Uploading…
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Save sponsor first, then upload a logo.</p>
              )}
            </div>

            {!isNew && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                  data-testid="sponsor-active-toggle"
                />
                <span className="font-semibold">Active (shown on public sponsors page)</span>
              </label>
            )}
          </Card>

          <div className="mt-6 flex gap-3">
            <Button
              type="submit"
              className="bg-yellow-700 text-white hover:bg-yellow-800"
              disabled={saving}
              data-testid="save-sponsor-btn"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving…' : isNew ? 'Create Sponsor' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/sponsors')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSponsorEditPage;
