import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const SubmitStoryPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: 'news',
    title: '',
    description: '',
    content: '',
    author: '',
    grade: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['news', 'arts', 'opinion', 'sports', 'poetry', 'science', 'quick thought'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, just show success message (will connect to backend later)
      toast({
        title: "Story Submitted!",
        description: "Your story has been submitted for review.",
      });
      
      // Reset form
      setFormData({
        category: 'news',
        title: '',
        description: '',
        content: '',
        author: '',
        grade: ''
      });
      setImage(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit story. Please try again.",
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Your Story</h1>
          <p className="text-gray-600">Share your amazing stories with the Calusa community!</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Author Name</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Grade (Optional)</label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                placeholder="e.g., 5th Grade"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Story Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter your story title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="A brief description of your story"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Story</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Write your full story here..."
                rows={10}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Story Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-blue-700 text-white hover:bg-blue-800 flex-1"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Story'}
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

export default SubmitStoryPage;