import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trash2, Palette, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const AdminArtPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        api.get('/art/pending'),
        api.get('/art'),
      ]);
      setPending(p.data);
      setApproved(a.data);
    } catch (e) {
      toast({ title: 'Failed to load artwork', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/art/${id}/approve`);
      const item = pending.find((a) => a.id === id);
      setPending((arr) => arr.filter((a) => a.id !== id));
      if (item) setApproved((arr) => [{ ...item, approved: true }, ...arr]);
      toast({ title: 'Art approved', description: 'Visible in gallery now' });
    } catch (e) {
      toast({ title: 'Approve failed', variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await api.put(`/art/${id}/feature`);
      setApproved((arr) => arr.map((a) => (a.id === id ? { ...a, featured: res.data.featured } : a)));
      toast({ title: res.data.featured ? 'Marked featured' : 'Removed featured' });
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id, fromApproved = false) => {
    if (!window.confirm('Delete this artwork?')) return;
    try {
      await api.delete(`/art/${id}`);
      if (fromApproved) setApproved((arr) => arr.filter((a) => a.id !== id));
      else setPending((arr) => arr.filter((a) => a.id !== id));
      toast({ title: 'Artwork deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-pink-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-pink-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Art Submissions</h1>
          <p className="text-pink-200 text-sm">Review and approve student artwork</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading…</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4" data-testid="art-pending-count">
                Pending Approval ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">No pending submissions</Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pending.map((art) => (
                    <Card
                      key={art.id}
                      className="overflow-hidden"
                      data-testid={`pending-art-${art.id}`}
                    >
                      {art.image_url ? (
                        <img
                          src={assetUrl(art.image_url)}
                          alt={art.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <Palette size={40} className="text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{art.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          By {art.artist_name}
                          {art.grade && ` · ${art.grade}`}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(art.id)}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            data-testid={`approve-art-${art.id}`}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(art.id)}
                            data-testid={`delete-art-${art.id}`}
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
              <h2 className="text-2xl font-bold mb-4" data-testid="art-approved-count">
                Approved Artwork ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">No approved artwork</Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {approved.map((art) => (
                    <Card
                      key={art.id}
                      className="overflow-hidden"
                      data-testid={`approved-art-${art.id}`}
                    >
                      {art.image_url && (
                        <img
                          src={assetUrl(art.image_url)}
                          alt={art.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-3">
                        <h3 className="font-bold text-sm mb-1 flex items-center gap-1">
                          {art.featured && (
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          )}
                          {art.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{art.artist_name}</p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleToggleFeatured(art.id)}
                            data-testid={`feature-art-${art.id}`}
                          >
                            {art.featured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(art.id, true)}
                            data-testid={`delete-approved-art-${art.id}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
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

export default AdminArtPage;
