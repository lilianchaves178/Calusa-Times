import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trash2, DollarSign, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const colorClasses = {
  yellow: 'bg-yellow-200',
  pink: 'bg-pink-200',
  blue: 'bg-blue-200',
  green: 'bg-green-200',
  orange: 'bg-orange-200',
  purple: 'bg-purple-200',
};

const AdminMuralPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        api.get('/mural/pending'),
        api.get('/mural'),
      ]);
      setPending(pendingRes.data);
      setApproved(approvedRes.data);
    } catch (e) {
      toast({ title: 'Failed to load messages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/mural/${id}/approve`);
      setPending((arr) => arr.filter((m) => m.id !== id));
      setApproved((arr) => [res.data, ...arr]);
      toast({ title: 'Message approved', description: 'Visible on the mural now' });
    } catch (e) {
      toast({ title: 'Approve failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id, fromApproved = false) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/mural/${id}`);
      if (fromApproved) setApproved((arr) => arr.filter((m) => m.id !== id));
      else setPending((arr) => arr.filter((m) => m.id !== id));
      toast({ title: 'Message deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-orange-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-orange-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Mural Messages Management</h1>
          <p className="text-orange-200 text-sm">
            Verify Givebacks payment, then approve for the cork board
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-900">
            <MessageCircle size={14} className="inline mr-1" />
            When a parent posts a message they are sent to Givebacks to pay $3 (plain) or $5 (featured).
            Approve a message here <strong>only after confirming payment</strong> in your Givebacks dashboard.
          </p>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading…</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4" data-testid="mural-pending-count">
                Pending Payment / Approval ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">No pending messages</Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pending.map((msg) => (
                    <Card
                      key={msg.id}
                      className="overflow-hidden"
                      data-testid={`pending-message-${msg.id}`}
                    >
                      <div className={`${colorClasses[msg.color] || 'bg-yellow-200'} p-6 relative`}>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-red-800"></div>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/80 rounded-full px-2 py-1 text-xs font-bold">
                          <DollarSign size={14} className="text-green-600" />${msg.price}{' '}
                          {msg.tier === 'featured' ? '⭐' : ''}
                        </div>
                        <p className="text-gray-800 font-handwriting text-lg mb-3 mt-2">
                          {msg.message}
                        </p>
                        <p className="text-gray-600 text-sm font-semibold text-right">
                          - {msg.author_name}
                        </p>
                      </div>
                      <div className="p-3">
                        {msg.payment_reference && (
                          <p className="text-xs text-gray-500 mb-2">
                            Reference: {msg.payment_reference}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(msg.id)}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            data-testid={`approve-message-${msg.id}`}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(msg.id)}
                            data-testid={`delete-message-${msg.id}`}
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

            <div>
              <h2 className="text-2xl font-bold mb-4" data-testid="mural-approved-count">
                Approved Messages ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">No approved messages yet</Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {approved.map((msg) => (
                    <Card
                      key={msg.id}
                      className="overflow-hidden"
                      data-testid={`approved-message-${msg.id}`}
                    >
                      <div className={`${colorClasses[msg.color] || 'bg-yellow-200'} p-4`}>
                        <p className="text-gray-800 font-handwriting text-sm mb-2">
                          {msg.message}
                        </p>
                        <p className="text-gray-600 text-xs text-right">- {msg.author_name}</p>
                      </div>
                      <div className="p-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(msg.id, true)}
                          className="w-full"
                          data-testid={`delete-approved-message-${msg.id}`}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMuralPage;
