import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (e) {
      toast({ title: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/auth/users/${userId}/role`, null, { params: { role: newRole } });
      setUsers((u) => u.map((x) => (x.id === userId ? { ...x, role: newRole } : x)));
      toast({ title: 'Role updated', description: `User role changed to ${newRole}` });
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers((u) => u.filter((x) => x.id !== userId));
      toast({ title: 'User deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      editor: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || colors.viewer;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-purple-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-purple-200 text-sm">Manage users and their permissions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold" data-testid="users-count">
            All Users ({users.length})
          </h2>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('/admin/users/new')}
            data-testid="add-user-btn"
          >
            <UserPlus size={18} className="mr-2" />
            Add New User
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading users…</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="p-6" data-testid={`user-row-${user.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getRoleBadge(
                          user.role,
                        )}`}
                      >
                        <Shield size={12} className="inline mr-1" />
                        {user.role}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      data-testid={`role-select-${user.id}`}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.id)}
                      data-testid={`delete-user-${user.id}`}
                    >
                      <Trash2 size={16} />
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

export default AdminUsersPage;
