import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { MessageSquare, DollarSign, ExternalLink, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const colors = [
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-200' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-200' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-200' },
  { value: 'green', label: 'Green', class: 'bg-green-200' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-200' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-200' },
];

const PostMessagePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    message: '',
    author_name: '',
    color: 'yellow',
    tier: 'plain',
  });
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState({
    tiers: { plain: 3, featured: 5 },
    givebacks_url: 'https://www.givebacks.com/causes/calusa/shop/items/50684',
    featured_slot_limit: 2,
    featured_slots_used: 0,
    featured_available: true,
  });
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    api
      .get('/mural/config/pricing')
      .then((res) => {
        setPricing(res.data);
        // If user had featured selected but it's no longer available, drop to plain
        if (!res.data.featured_available) {
          setFormData((f) => (f.tier === 'featured' ? { ...f, tier: 'plain' } : f));
        }
      })
      .catch(() => {});
  }, []);

  const price = pricing.tiers[formData.tier] ?? 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/mural', {
        message: formData.message,
        author_name: formData.author_name,
        color: formData.color,
        tier: formData.tier,
      });
      setSubmitted(res.data);
      // Open Givebacks in a new tab so the parent can complete payment
      window.open(pricing.givebacks_url, '_blank', 'noopener,noreferrer');
      toast({
        title: 'Message submitted!',
        description: 'Complete your donation on Givebacks to publish your message.',
      });
    } catch (err) {
      toast({
        title: 'Failed to submit',
        description: err?.response?.data?.detail || '',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Card className="p-10 text-center" data-testid="post-success-card">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-gray-900 mb-4">Message Submitted!</h1>
            <p className="text-gray-700 mb-6">
              Your message is saved as pending. Complete your{' '}
              <strong>${submitted.price}</strong> donation on Givebacks to have it approved and
              pinned to the Community Mural.
            </p>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Your message:</strong> "{submitted.message}"
              </p>
              <p className="text-sm text-gray-700">
                <strong>From:</strong> {submitted.author_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Tier:</strong>{' '}
                {submitted.tier === 'featured' ? 'Featured ($5)' : 'Plain ($3)'}
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href={pricing.givebacks_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="go-to-givebacks-btn"
              >
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <ExternalLink size={16} className="mr-2" />
                  Pay ${submitted.price} on Givebacks
                </Button>
              </a>
              <Button variant="outline" onClick={() => navigate('/mural')}>
                Back to Mural
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              Our team will verify your Givebacks donation and pin your message to the mural within
              1 business day.
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Name</label>
                  <Input
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    placeholder="e.g., Mom & Dad, The Johnsons, Grandma"
                    required
                    data-testid="post-author-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Your Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Happy Birthday! Great job! Congratulations! Keep shining!..."
                    rows={5}
                    maxLength={200}
                    required
                    data-testid="post-message-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Choose a Color</label>
                  <div className="grid grid-cols-3 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`${color.class} p-4 rounded-lg border-4 transition-all ${
                          formData.color === color.value
                            ? 'border-gray-800 shadow-lg scale-105'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        data-testid={`post-color-${color.value}`}
                      >
                        <span className="font-semibold text-gray-800">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Tier</label>
                  <div
                    className={`grid grid-cols-1 ${
                      pricing.featured_available ? 'md:grid-cols-2' : ''
                    } gap-3`}
                  >
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tier: 'plain' })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.tier === 'plain'
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      data-testid="post-tier-plain"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">Plain</span>
                        <span className="text-2xl font-black text-amber-600">
                          ${pricing.tiers.plain}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Standard post-it on the mural</p>
                    </button>
                    {pricing.featured_available && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tier: 'featured' })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.tier === 'featured'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        data-testid="post-tier-featured"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900 flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" /> Featured
                          </span>
                          <span className="text-2xl font-black text-amber-600">
                            ${pricing.tiers.featured}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Larger, highlighted with a golden ring
                          <span className="block text-[10px] text-amber-700 mt-1">
                            {pricing.featured_slot_limit - pricing.featured_slots_used} of{' '}
                            {pricing.featured_slot_limit} spots available
                          </span>
                        </p>
                      </button>
                    )}
                  </div>
                  {!pricing.featured_available && (
                    <p
                      className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3"
                      data-testid="featured-full-notice"
                    >
                      <Star size={12} className="inline mr-1 text-yellow-600 fill-yellow-500" />
                      Featured spots are full right now! Both featured slots are currently taken.
                      Check back after one expires, or grab the plain tier for $
                      {pricing.tiers.plain}.
                    </p>
                  )}
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Preview</label>
                  <div
                    className={`${
                      colors.find((c) => c.value === formData.color)?.class
                    } p-6 rounded-sm shadow-lg transform rotate-2 relative ${
                      formData.tier === 'featured' ? 'ring-4 ring-yellow-400' : ''
                    }`}
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-6 h-6 bg-red-600 rounded-full shadow-lg border-2 border-red-800"></div>
                    </div>
                    <div className="mt-4">
                      <p
                        className={`text-gray-800 font-handwriting mb-4 leading-relaxed min-h-[80px] ${
                          formData.tier === 'featured' ? 'text-2xl' : 'text-lg'
                        }`}
                      >
                        {formData.message || 'Your message will appear here...'}
                      </p>
                      <p className="text-gray-600 text-sm font-semibold text-right">
                        - {formData.author_name || 'Your name'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-amber-600 text-white hover:bg-amber-700 flex-1"
                    disabled={loading}
                    data-testid="continue-to-payment-btn"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    {loading ? 'Submitting…' : `Continue to Givebacks ($${price})`}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/mural')}>
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Clicking continue submits your message and opens Givebacks in a new tab for
                  payment.
                </p>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={24} className="text-amber-600" />
                <h3 className="text-xl font-bold text-gray-900">Pricing</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Plain</p>
                    <p className="text-xs text-gray-600">Standard post-it</p>
                  </div>
                  <div className="text-3xl font-black text-amber-600">
                    ${pricing.tiers.plain}
                  </div>
                </div>
                {pricing.featured_available ? (
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" /> Featured
                      </p>
                      <p className="text-xs text-gray-600">Larger & highlighted</p>
                    </div>
                    <div className="text-3xl font-black text-amber-600">
                      ${pricing.tiers.featured}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 opacity-80">
                    <p className="font-bold text-gray-700 flex items-center gap-1 line-through">
                      <Star size={14} className="text-gray-400" /> Featured — sold out
                    </p>
                    <p className="text-xs text-gray-500">
                      Both featured spots are taken — check back soon!
                    </p>
                  </div>
                )}
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
                  <strong>100% of proceeds</strong> support Calusa Elementary student programs
                  through Givebacks.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        .font-handwriting { font-family: 'Permanent Marker', cursive; }
      `}</style>
    </div>
  );
};

export default PostMessagePage;
