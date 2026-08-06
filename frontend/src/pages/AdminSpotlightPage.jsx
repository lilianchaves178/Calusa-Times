import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const emptySpotlight = { name: '', grade: '', quote: '', order: 0, is_active: true };

const AdminSpotlightPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState(emptySpotlight);
  const [formImage, setFormImage] = useState(null); // File picked in the create/edit form, not yet uploaded
  const [formImagePreview, setFormImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingImageFor, setSavingImageFor] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [all, pendingRes] = await Promise.all([
        api.get('/spotlight', { params: { active_only: false } }),
        api.get('/spotlight/pending'),
      ]);
      // Merge — /spotlight (active_only=false) still filters by approved=True for non-admin.
      // Combine approved results with pending ones so the admin sees everything.
      const byId = new Map();
      [...all.data, ...pendingRes.data].forEach((s) => byId.set(s.id, s));
      setList(Array.from(byId.values()));
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
    setForm({ ...emptySpotlight, order: list.length + 1 });
    setFormImage(null);
    setFormImagePreview(null);
  };

  const openEdit = (student) => {
    setEditing(student.id);
    setForm({ ...student });
    setFormImage(null);
    setFormImagePreview(student.image_url ? assetUrl(student.image_url) : null);
  };

  const close = () => {
    setEditing(null);
    setForm(emptySpotlight);
    setFormImage(null);
    setFormImagePreview(null);
  };

  const pickFormImage = (file) => {
    if (!file) return;
    setFormImage(file);
    setFormImagePreview(URL.createObjectURL(file));
  };

  const save = async () => {
    setSaving(true);
    try {
      let studentId = editing;
      if (editing === 'new') {
        const res = await api.post('/spotlight', form);
        studentId = res.data.id;
      } else {
        await api.put(`/spotlight/${editing}`, form);
      }

      if (formImage) {
        const fd = new FormData();
        fd.append('file', formImage);
        await api.post(`/spotlight/${studentId}/upload-image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast({ title: editing === 'new' ? 'Spotlight student added' : 'Saved' });
      close();
      load();
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

  const remove = async (id) => {
    if (!window.confirm('Remove this student from the spotlight?')) return;
    try {
      await api.delete(`/spotlight/${id}`);
      load();
      toast({ title: 'Removed' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const toggle = async (student) => {
    try {
      await api.put(`/spotlight/${student.id}`, { is_active: !student.is_active });
      load();
    } catch {
      toast({ title: 'Toggle failed', variant: 'destructive' });
    }
  };

  const approve = async (student) => {
    try {
      await api.put(`/spotlight/${student.id}/approve`);
      toast({ title: 'Spotlight approved', description: `${student.name} is now live.` });
      load();
    } catch {
      toast({ title: 'Approve failed', variant: 'destructive' });
    }
  };

  const uploadImage = async (id, file) => {
    if (!file) return;
    setSavingImageFor(id);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/spotlight/${id}/upload-image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Image uploaded' });
      load();
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setSavingImageFor(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-yellow-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-yellow-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Student Spotlight</h1>
          <p className="text-yellow-100 text-sm">Feature students on the homepage spotlight carousel</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" data-testid="spotlight-count">Students ({list.length})</h2>
          <Button
            onClick={openNew}
            className="bg-yellow-600 hover:bg-yellow-700"
            data-testid="add-spotlight-btn"
          >
            <Plus size={16} className="mr-2" />
            Add Student
          </Button>
        </div>

        {editing && (
          <Card className="p-6 mb-6 border-2 border-yellow-400">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {editing === 'new' ? 'New Spotlight Student' : 'Edit Student'}
              </h3>
              <Button variant="ghost" size="icon" onClick={close}>
                <X size={20} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                placeholder="Student name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="spotlight-name-input"
              />
              <Input
                placeholder="Grade (e.g., 5th Grade)"
                value={form.grade || ''}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                data-testid="spotlight-grade-input"
              />
            </div>
            <Textarea
              placeholder="Student's quote"
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              rows={3}
              className="mb-4"
              data-testid="spotlight-quote-input"
            />
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                  {formImagePreview ? (
                    <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={22} className="text-gray-400" />
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-gray-50 border rounded text-sm hover:bg-gray-100">
                  <Upload size={14} />
                  {formImagePreview ? 'Change photo' : 'Choose photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickFormImage(e.target.files[0])}
                    data-testid="spotlight-form-image-input"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optional — attach it now, or add one later from the student's card.
              </p>
            </div>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <label className="text-sm flex items-center gap-2">
                Order:
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-20"
                  data-testid="spotlight-order-input"
                />
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active (show on site)
              </label>
            </div>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-yellow-600 hover:bg-yellow-700"
              data-testid="save-spotlight-btn"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : list.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            No spotlight students yet — add your first one!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...list]
              .sort((a, b) => Number(a.approved) - Number(b.approved))
              .map((student) => (
              <Card
                key={student.id}
                className={`p-4 ${!student.is_active ? 'opacity-60' : ''} ${
                  !student.approved ? 'border-l-4 border-yellow-400' : ''
                }`}
                data-testid={`spotlight-row-${student.id}`}
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {student.image_url ? (
                      <img
                        src={assetUrl(student.image_url)}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold truncate">{student.name}</h3>
                      {!student.approved && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold uppercase px-1.5 py-0.5 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                    {student.grade && <p className="text-xs text-gray-600">{student.grade}</p>}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{student.quote}"</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!student.approved && (
                    <Button
                      size="sm"
                      onClick={() => approve(student)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid={`approve-spotlight-${student.id}`}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Approve
                    </Button>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-gray-50 rounded text-xs hover:bg-gray-100">
                    <Upload size={12} />
                    {savingImageFor === student.id ? 'Uploading…' : 'Upload photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadImage(student.id, e.target.files[0])}
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(student)}
                      className="flex-1"
                      data-testid={`edit-spotlight-${student.id}`}
                    >
                      <Edit size={12} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggle(student)}
                      data-testid={`toggle-spotlight-${student.id}`}
                    >
                      {student.is_active ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(student.id)}
                      data-testid={`delete-spotlight-${student.id}`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSpotlightPage;
