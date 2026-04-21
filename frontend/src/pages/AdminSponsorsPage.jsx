import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminSponsorsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState([
    { id: '1', name: 'Calusa Community Bank', tier: 'platinum', logo_url: 'https://via.placeholder.com/300x150?text=Platinum', website_url: 'https://example.com', is_active: true },
    { id: '2', name: 'Local Pizza Shop', tier: 'gold', logo_url: 'https://via.placeholder.com/250x120?text=Gold', website_url: 'https://example.com', is_active: true },
    { id: '3', name: 'Book Store', tier: 'silver', logo_url: 'https://via.placeholder.com/200x100?text=Silver', website_url: 'https://example.com', is_active: true }
  ]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this sponsor?')) {
      setSponsors(sponsors.filter(s => s.id !== id));
      toast({ title: "Sponsor Deleted" });
    }
  };

  const handleAddNew = () => {
    toast({ title: "Add Sponsor", description: "Sponsor form coming soon!" });
  };

  const getTierColor = (tier) => {
    const colors = {
      platinum: 'bg-purple-100 text-purple-700',
      gold: 'bg-yellow-100 text-yellow-700',
      silver: 'bg-gray-100 text-gray-700',
      bronze: 'bg-orange-100 text-orange-700'
    };
    return colors[tier] || colors.silver;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-yellow-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="text-white border-white hover:bg-yellow-800 mb-4">
            <ArrowLeft size={18} className="mr-2" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Sponsors Management</h1>
          <p className="text-yellow-200 text-sm">Manage sponsor listings and tiers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Sponsors ({sponsors.length})</h2>
          <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={handleAddNew}>
            <Plus size={18} className="mr-2" />Add New Sponsor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map(sponsor => (
            <Card key={sponsor.id} className="overflow-hidden">
              <div className="bg-white p-6 flex items-center justify-center h-32 border-b">
                <img src={sponsor.logo_url} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">{sponsor.name}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${getTierColor(sponsor.tier)}`}>
                    {sponsor.tier}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{sponsor.website_url}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit size={14} className="mr-1" />Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(sponsor.id)}>
                    <Trash2 size={14} />
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

export default AdminSponsorsPage;