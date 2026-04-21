import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const AdminSponsorsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sponsors', { params: { active_only: false } });
      const sorted = [...res.data].sort(
        (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
      );
      setSponsors(sorted);
    } catch (e) {
      toast({ title: 'Failed to load sponsors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await api.delete(`/sponsors/${id}`);
      setSponsors((arr) => arr.filter((s) => s.id !== id));
      toast({ title: 'Sponsor deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      platinum: 'bg-purple-100 text-purple-700',
      gold: 'bg-yellow-100 text-yellow-700',
      silver: 'bg-gray-100 text-gray-700',
      bronze: 'bg-orange-100 text-orange-700',
    };
    return colors[tier] || colors.silver;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-yellow-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-yellow-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Sponsors Management</h1>
          <p className="text-yellow-200 text-sm">Manage sponsor listings and tiers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold" data-testid="sponsors-count">
            All Sponsors ({sponsors.length})
          </h2>
          <Button
            className="bg-yellow-600 hover:bg-yellow-700"
            onClick={() => navigate('/admin/sponsors/new')}
            data-testid="add-sponsor-btn"
          >
            <Plus size={18} className="mr-2" />
            Add New Sponsor
          </Button>
        </div>

        {loading ? (
          <div className="text-gray-600 text-center py-12">Loading…</div>
        ) : sponsors.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">No sponsors yet. Add your first sponsor!</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sponsor) => (
              <Card
                key={sponsor.id}
                className="overflow-hidden"
                data-testid={`sponsor-row-${sponsor.id}`}
              >
                <div className="bg-white p-6 flex items-center justify-center h-32 border-b">
                  {sponsor.logo_url ? (
                    <img
                      src={assetUrl(sponsor.logo_url)}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No logo uploaded</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-lg">{sponsor.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded uppercase ${getTierColor(
                        sponsor.tier,
                      )}`}
                    >
                      {sponsor.tier}
                    </span>
                    {!sponsor.is_active && (
                      <span className="px-2 py-1 text-xs font-bold rounded uppercase bg-gray-200 text-gray-600">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  {sponsor.website_url && (
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-1 truncate">
                      <Globe size={14} /> {sponsor.website_url}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/admin/sponsors/${sponsor.id}/edit`)}
                      data-testid={`edit-sponsor-${sponsor.id}`}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(sponsor.id)}
                      data-testid={`delete-sponsor-${sponsor.id}`}
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
    </div>
  );
};

export default AdminSponsorsPage;
