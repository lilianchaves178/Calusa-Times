import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trash2, Palette } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminArtPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [artworks, setArtworks] = useState([
    { id: '1', title: 'Sunset Dreams', artist_name: 'Emma Rodriguez', grade: '4th Grade', approved: false, image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400' },
    { id: '2', title: 'Ocean Life', artist_name: 'Marcus Chen', grade: '5th Grade', approved: false, image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400' },
    { id: '3', title: 'Space Explorer', artist_name: 'Lily Patel', grade: '3rd Grade', approved: true, image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400' }
  ]);

  const handleApprove = (id) => {
    setArtworks(artworks.map(a => a.id === id ? {...a, approved: true} : a));
    toast({ title: "Art Approved", description: "The artwork is now visible in the gallery!" });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this artwork?')) {
      setArtworks(artworks.filter(a => a.id !== id));
      toast({ title: "Artwork Deleted" });
    }
  };

  const pending = artworks.filter(a => !a.approved);
  const approved = artworks.filter(a => a.approved);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-pink-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="text-white border-white hover:bg-pink-800 mb-4">
            <ArrowLeft size={18} className="mr-2" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Art Submissions</h1>
          <p className="text-pink-200 text-sm">Review and approve student artwork</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Approval ({pending.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pending.map(art => (
              <Card key={art.id} className="overflow-hidden">
                <img src={art.image_url} alt={art.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{art.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">By {art.artist_name} • {art.grade}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(art.id)} className="bg-green-600 hover:bg-green-700 flex-1">
                      <CheckCircle size={16} className="mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(art.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Approved Artwork ({approved.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approved.map(art => (
              <Card key={art.id} className="overflow-hidden">
                <img src={art.image_url} alt={art.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-1">{art.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{art.artist_name}</p>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(art.id)} className="w-full">
                    <Trash2 size={14} className="mr-1" />Delete
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

export default AdminArtPage;