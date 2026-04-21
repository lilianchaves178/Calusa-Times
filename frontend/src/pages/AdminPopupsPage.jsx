import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const AdminPopupsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/popups/all');
      setPopups(res.data);
    } catch (e) {
      toast({ title: 'Failed to load popups', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleActive = async (popup) => {
    try {
      await api.put(`/popups/${popup.id}`, { is_active: !popup.is_active });
      setPopups((arr) =>
        arr.map((p) => (p.id === popup.id ? { ...p, is_active: !popup.is_active } : p)),
      );
      toast({ title: popup.is_active ? 'Deactivated' : 'Activated' });
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this popup?')) return;
    try {
      await api.delete(`/popups/${id}`);
      setPopups((arr) => arr.filter((p) => p.id !== id));
      toast({ title: 'Popup deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-orange-100 text-orange-700',
      success: 'bg-green-100 text-green-700',
      announcement: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-red-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-red-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Popup Announcements</h1>
          <p className="text-red-200 text-sm">Create and manage announcement popups</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold" data-testid="popups-count">
            All Popups ({popups.length})
          </h2>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => navigate('/admin/popups/new')}
            data-testid="create-popup-btn"
          >
            <Plus size={18} className="mr-2" />
            Create New Popup
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading…</div>
        ) : popups.length === 0 ? (
          <Card className="p-12 text-center">
            <Megaphone size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No popups yet. Create one to announce something!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {popups.map((popup) => (
              <Card key={popup.id} className="p-6" data-testid={`popup-row-${popup.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold">{popup.title}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getTypeColor(
                          popup.type,
                        )}`}
                      >
                        {popup.type}
                      </span>
                      {popup.is_active ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{popup.message}</p>
                    <p className="text-sm text-gray-500">
                      {popup.show_once ? '✓ Show once per user' : '○ Show every visit'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(popup)}
                      data-testid={`toggle-popup-${popup.id}`}
                    >
                      {popup.is_active ? (
                        <ToggleRight size={16} className="mr-1 text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="mr-1" />
                      )}
                      {popup.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/popups/${popup.id}/edit`)}
                      data-testid={`edit-popup-${popup.id}`}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(popup.id)}
                      data-testid={`delete-popup-${popup.id}`}
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

export default AdminPopupsPage;
