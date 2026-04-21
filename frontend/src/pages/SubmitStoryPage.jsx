import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';
import PexelsImagePicker from '../components/PexelsImagePicker';

const categories = ['news', 'arts', 'opinion', 'sports', 'poetry', 'science', 'quick thought'];

const SubmitStoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: 'news',
    title: '',
    description: '',
    content: '',
    author: '',
    grade: '',
  });
  const [image, setImage] = useState(null);
  const [stockImageUrl, setStockImageUrl] = useState(''); // Pexels image URL (already on our server)
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_url = stockImageUrl || '';
      if (image) {
        const fd = new FormData();
        fd.append('file', image);
        const upRes = await api.post('/articles/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        image_url = upRes.data.image_url;
      }

      await api.post('/articles', { ...formData, image_url });
      toast({
        title: 'Story submitted!',
        description: 'Thanks! Your story will appear after a Calusa Times editor approves it.',
      });
      navigate('/articles');
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err?.response?.data?.detail || 'Please try again.',
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Your Story</h1>
          <p className="text-gray-600">Share your amazing stories with the Calusa community!</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  data-testid="submit-category-select"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Author Name</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Your name"
                  required
                  data-testid="submit-author-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Grade (Optional)</label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., 5th Grade"
                data-testid="submit-grade-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Story Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="submit-title-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Short Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                data-testid="submit-description-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Full Story</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                required
                data-testid="submit-content-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Story Image (Optional)</label>
              {stockImageUrl && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={assetUrl(stockImageUrl)}
                    alt="Stock preview"
                    className="max-h-40 rounded-lg border"
                    data-testid="submit-story-stock-preview"
                  />
                  <button
                    type="button"
                    onClick={() => setStockImageUrl('')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold"
                    aria-label="Remove stock image"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  data-testid="submit-image-input"
                />
                <span className="text-xs text-gray-500">or</span>
                <PexelsImagePicker
                  target="articles"
                  onImported={(url) => {
                    setImage(null);
                    setStockImageUrl(url);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload your own picture, or browse free stock photos from Pexels.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-blue-700 text-white hover:bg-blue-800 flex-1"
                disabled={loading}
                data-testid="submit-story-btn"
              >
                {loading ? 'Submitting…' : 'Submit Story'}
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

export default SubmitStoryPage;
