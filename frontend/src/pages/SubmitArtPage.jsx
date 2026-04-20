import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Palette } from 'lucide-react';

const SubmitArtPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist_name: '',
    grade: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      toast({
        title: "Art Submitted!",
        description: "Your artwork has been submitted for review.",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        artist_name: '',
        grade: ''
      });
      setImage(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit artwork. Please try again.",
        variant: "destructive"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Artist Name</label>
                <Input
                  value={formData.artist_name}
                  onChange={(e) => setFormData({...formData, artist_name: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Grade (Optional)</label>
                <Input
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  placeholder="e.g., 5th Grade"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Artwork Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Give your artwork a title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tell us about your artwork..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Your Artwork</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF (Max 5MB)</p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-purple-600 text-white hover:bg-purple-700 flex-1"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Artwork'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
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