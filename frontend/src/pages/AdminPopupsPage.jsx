import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminPopupsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [popups, setPopups] = useState([
    { id: '1', title: 'Spring Art Show - April 21st!', message: 'Join us for the annual Spring Art Show...', type: 'announcement', is_active: true, show_once: true },
    { id: '2', title: 'Important: School Closed Tomorrow', message: 'School will be closed due to weather...', type: 'warning', is_active: false, show_once: false }
  ]);

  const handleAddNew = () => {
    toast({ title: "Create Popup", description: "Popup form coming soon!" });
  };

  const handleToggleActive = (id) => {
    setPopups(popups.map(p => p.id === id ? {...p, is_active: !p.is_active} : p));
    toast({ title: "Status Updated" });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this popup?')) {
      setPopups(popups.filter(p => p.id !== id));
      toast({ title: "Popup Deleted" });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-orange-100 text-orange-700',
      success: 'bg-green-100 text-green-700',
      announcement: 'bg-purple-100 text-purple-700'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-red-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="text-white border-white hover:bg-red-800 mb-4">
            <ArrowLeft size={18} className="mr-2" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Popup Announcements</h1>
          <p className="text-red-200 text-sm">Create and manage announcement popups</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Popups ({popups.length})</h2>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddNew}>
            <Plus size={18} className="mr-2" />Create New Popup
          </Button>
        </div>

        <div className="space-y-4">
          {popups.map(popup => (
            <Card key={popup.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{popup.title}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getTypeColor(popup.type)}`}>
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
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleActive(popup.id)}
                  >
                    {popup.is_active ? <ToggleRight size={16} className="mr-1 text-green-600" /> : <ToggleLeft size={16} className="mr-1" />}
                    {popup.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(popup.id)}>
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

export default AdminPopupsPage;