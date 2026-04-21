import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Palette } from 'lucide-react';
import api from '../lib/api';

const SubmitArtPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist_name: '',
    grade: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast({ title: 'Please select an image', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      const createRes = await api.post('/art', formData);
      const artId = createRes.data.id;

      const fd = new FormData();
      fd.append('file', image);
      await api.post(`/art/${artId}/upload-image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: 'Art submitted!',
        description: "Thanks! It'll appear in the gallery after approval.",
      });
      navigate('/student-art');
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err?.response?.data?.detail || '',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Palette size={32} className="text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Submit Your Artwork</h1>
          </div>
          <p className="text-gray-600">Share your creative masterpieces with the Calusa community!</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Artist Name</label>
                <Input
                  value={formData.artist_name}
                  onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                  placeholder="Your name"
                  required
                  data-testid="submit-art-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Grade (Optional)</label>
                <Input
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., 5th Grade"
                  data-testid="submit-art-grade-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Artwork Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="submit-art-title-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                data-testid="submit-art-description-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Upload Your Artwork</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
                data-testid="submit-art-image-input"
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF</p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-purple-600 text-white hover:bg-purple-700 flex-1"
                disabled={loading}
                data-testid="submit-art-btn"
              >
                {loading ? 'Submitting…' : 'Submit Artwork'}
              </Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SubmitArtPage;
