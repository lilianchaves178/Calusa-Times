import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const AdminUserCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'editor',
  });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/auth/register', form);
      toast({ title: 'User created', description: `${form.email} can now sign in.` });
      navigate('/admin/users');
    } catch (err) {
      toast({
        title: 'Failed to create user',
        description: err?.response?.data?.detail || '',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-900 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/users')}
            variant="outline"
            className="text-white border-white hover:bg-purple-800 mb-4"
            data-testid="back-to-users-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Users
          </Button>
          <h1 className="text-3xl font-bold">Add New User</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <Input
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                required
                data-testid="new-user-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
                data-testid="new-user-email-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
                minLength={6}
                data-testid="new-user-password-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                data-testid="new-user-role-select"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </Card>
          <div className="mt-6 flex gap-3">
            <Button
              type="submit"
              className="bg-purple-700 text-white hover:bg-purple-800"
              disabled={saving}
              data-testid="save-user-btn"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Creating…' : 'Create User'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserCreatePage;
