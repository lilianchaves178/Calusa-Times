import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle, Trash2, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminMuralPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    { id: '1', message: 'Happy Birthday Sarah! 🎉', author_name: 'Mom & Dad', color: 'yellow', approved: false, paid: true },
    { id: '2', message: 'Great job on the science fair!', author_name: 'The Johnsons', color: 'pink', approved: false, paid: true },
    { id: '3', message: 'Congratulations! ⭐', author_name: 'Grandma', color: 'blue', approved: true, paid: true }
  ]);

  const handleApprove = (id) => {
    setMessages(messages.map(m => m.id === id ? {...m, approved: true} : m));
    toast({ title: "Message Approved", description: "The message is now visible on the mural!" });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this message?')) {
      setMessages(messages.filter(m => m.id !== id));
      toast({ title: "Message Deleted" });
    }
  };

  const colorClasses = {
    yellow: 'bg-yellow-200',
    pink: 'bg-pink-200',
    blue: 'bg-blue-200',
    green: 'bg-green-200',
    orange: 'bg-orange-200',
    purple: 'bg-purple-200'
  };

  const pending = messages.filter(m => !m.approved);
  const approved = messages.filter(m => m.approved);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-orange-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="text-white border-white hover:bg-orange-800 mb-4">
            <ArrowLeft size={18} className="mr-2" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Mural Messages Management</h1>
          <p className="text-orange-200 text-sm">Approve and manage community mural posts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Approval ({pending.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pending.map(msg => (
              <Card key={msg.id} className="overflow-hidden">
                <div className={`${colorClasses[msg.color]} p-6 relative`}>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-red-800"></div>
                  </div>
                  {msg.paid && (
                    <div className="absolute top-2 right-2">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                  )}
                  <p className="text-gray-800 font-handwriting text-lg mb-3 mt-2">{msg.message}</p>
                  <p className="text-gray-600 text-sm font-semibold text-right">- {msg.author_name}</p>
                </div>
                <div className="p-3 flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(msg.id)} className="bg-green-600 hover:bg-green-700 flex-1">
                    <CheckCircle size={16} className="mr-1" />Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(msg.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Approved Messages ({approved.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {approved.map(msg => (
              <Card key={msg.id} className="overflow-hidden">
                <div className={`${colorClasses[msg.color]} p-4`}>
                  <p className="text-gray-800 font-handwriting text-sm mb-2">{msg.message}</p>
                  <p className="text-gray-600 text-xs text-right">- {msg.author_name}</p>
                </div>
                <div className="p-2">
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(msg.id)} className="w-full">
                    <Trash2 size={14} />Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMuralPage;