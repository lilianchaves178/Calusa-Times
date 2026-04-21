import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState([
    { id: '1', email: 'admin@calusaschool.org', full_name: 'Calusa Admin', role: 'admin', is_active: true },
    { id: '2', email: 'teacher@calusaschool.org', full_name: 'Ms. Johnson', role: 'editor', is_active: true },
    { id: '3', email: 'student@calusaschool.org', full_name: 'Sofia Martinez', role: 'viewer', is_active: true }
  ]);

  const handleChangeRole = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? {...u, role: newRole} : u));
    toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
  };

  const handleAddUser = () => {
    toast({ 
      title: "Add User", 
      description: "User creation form coming soon! For now, users can register at /admin" 
    });
  };

  const handleDelete = (userId) => {
    if (window.confirm('Delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      toast({ title: "User Deleted" });
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      editor: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-700'
    };
    return colors[role] || colors.viewer;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="text-white border-white hover:bg-purple-800 mb-4">
            <ArrowLeft size={18} className="mr-2" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-purple-200 text-sm">Manage users and their permissions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Users ({users.length})</h2>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAddUser}>
            <UserPlus size={18} className="mr-2" />Add New User
          </Button>
        </div>

        <div className="space-y-4">
          {users.map(user => (
            <Card key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getRoleBadge(user.role)}`}>
                      <Shield size={12} className="inline mr-1" />{user.role}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;