import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { MessageSquare, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostMessagePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    message: '',
    author_name: '',
    color: 'yellow'
  });
  const [loading, setLoading] = useState(false);

  const colors = [
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-200' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-200' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-200' },
    { value: 'green', label: 'Green', class: 'bg-green-200' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-200' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-200' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, just show success message (will integrate with payment later)
      toast({
        title: "Message Submitted!",
        description: "Your message has been submitted for approval. You'll be redirected to payment.",
      });
      
      setTimeout(() => {
        navigate('/mural');
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit message. Please try again.",
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
            <MessageSquare size={32} className="text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-900">Post a Message</h1>
          </div>
          <p className="text-gray-600">Share your message on the Community Mural!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                  <Input
                    value={formData.author_name}
                    onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                    placeholder="e.g., Mom & Dad, The Johnsons, Grandma"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Happy Birthday! Great job! Congratulations! Keep shining!..."
                    rows={6}
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Choose a Color</label>
                  <div className="grid grid-cols-3 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({...formData, color: color.value})}
                        className={`${color.class} p-4 rounded-lg border-4 transition-all ${
                          formData.color === color.value 
                            ? 'border-gray-800 shadow-lg scale-105' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="font-semibold text-gray-800">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Preview</label>
                  <div className="relative">
                    <div 
                      className={`${colors.find(c => c.value === formData.color)?.class} p-6 rounded-sm shadow-lg transform rotate-2 relative`}
                    >
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-6 h-6 bg-red-600 rounded-full shadow-lg border-2 border-red-800"></div>
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-800 font-handwriting text-lg mb-4 leading-relaxed min-h-[80px]">
                          {formData.message || "Your message will appear here..."}
                        </p>
                        <p className="text-gray-600 text-sm font-semibold text-right">
                          - {formData.author_name || "Your name"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="bg-amber-600 text-white hover:bg-amber-700 flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Continue to Payment'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/mural')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Pricing Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={24} className="text-amber-600" />
                <h3 className="text-xl font-bold text-gray-900">Pricing</h3>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-black text-amber-600 mb-2">$5</div>
                <p className="text-gray-600">per message</p>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-2">What's Included:</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Your message on the Community Mural</li>
                  <li>✓ Displayed for 30 days</li>
                  <li>✓ Choose your post-it color</li>
                  <li>✓ Up to 200 characters</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>100% of proceeds</strong> support Calusa Elementary student programs, including art supplies, field trips, and educational resources.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        .font-handwriting {
          font-family: 'Permanent Marker', cursive;
        }
      `}</style>
    </div>
  );
};

export default PostMessagePage;
