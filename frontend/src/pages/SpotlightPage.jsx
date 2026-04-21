import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Quote, Sparkles, Upload, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';
import PexelsImagePicker from '../components/PexelsImagePicker';

const emptyForm = { name: '', grade: '', quote: '' };

const SpotlightPage = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [stockImageUrl, setStockImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get('/spotlight')
      .then((res) => setStudents(res.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/spotlight/submit', {
        ...form,
        image_url: stockImageUrl || undefined,
      });
      const newId = res.data.id;
      if (image) {
        const fd = new FormData();
        fd.append('file', image);
        await api.post(`/spotlight/${newId}/upload-image-public`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast({
        title: 'Submission received!',
        description: 'Thanks for sharing — an editor will review it soon.',
      });
      setForm(emptyForm);
      setImage(null);
      setStockImageUrl('');
      setSubmitted(true);
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users size={32} className="text-[#FFD700]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">Student Spotlight</h1>
          </div>
          <p className="text-gray-600">
            Celebrating the amazing students who make Calusa Elementary shine!{' '}
            <span className="font-semibold text-[#0f1e42]">
              Did something cool and worth celebrating? Tell us!
            </span>
          </p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500 mb-10" data-testid="no-spotlight-msg">
            No spotlight students yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {students.map((student) => (
              <div
                key={student.id}
                className="group relative rounded-2xl overflow-hidden bg-[#0f1e42] text-white shadow-lg flex flex-col min-h-[440px]"
                data-testid={`spotlight-${student.id}`}
              >
                {/* Hero image */}
                <div className="relative flex-1 min-h-[260px] overflow-hidden">
                  {student.image_url ? (
                    <img
                      src={assetUrl(student.image_url)}
                      alt={student.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                      <span className="text-7xl font-black text-[#0f1e42]">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Gold ribbon */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-[#FFD700] text-[#0f1e42] text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full shadow-md">
                    <Quote size={11} />
                    Spotlight
                  </div>

                  {/* Fade-to-dark overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0f1e42] via-[#0f1e42]/80 to-transparent" />

                  {/* Name + grade on lower image */}
                  <div className="absolute bottom-3 left-4 right-4 z-10">
                    <h3 className="text-2xl font-black leading-tight drop-shadow">
                      {student.name}
                    </h3>
                    {student.grade && (
                      <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wider mt-0.5">
                        {student.grade}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quote band */}
                <div className="px-5 py-4 bg-[#0f1e42]">
                  <blockquote className="italic text-gray-200 text-sm leading-snug">
                    &ldquo;{student.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Self-submission form */}
        <div className="mt-6 pt-8 border-t-2 border-dashed border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={28} className="text-yellow-500" />
            <h2 className="text-2xl font-black text-[#0f1e42]">Share Your Story</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Win a competition, build something amazing, help a neighbor? Tell the Calusa community
            about it and upload a picture. Your submission goes to an editor who may feature you
            on the Spotlight page.
          </p>

          {submitted ? (
            <Card className="p-8 flex items-start gap-4 bg-green-50 border-2 border-green-200 max-w-3xl">
              <CheckCircle size={40} className="text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">You're in the queue!</h3>
                <p className="text-green-800 mb-4">
                  Thanks for sharing — our editors will review your submission and feature you on
                  the Spotlight page once approved.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  data-testid="submit-another-btn"
                >
                  Submit another
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 md:p-8 max-w-3xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Your Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Sofia Martinez"
                      required
                      data-testid="spotlight-submit-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Grade (optional)</label>
                    <Input
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      placeholder="e.g., 5th Grade"
                      data-testid="spotlight-submit-grade"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    What did you do? Tell us about it!
                  </label>
                  <Textarea
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    placeholder="I won the regional spelling bee after studying for six months..."
                    rows={4}
                    required
                    maxLength={500}
                    data-testid="spotlight-submit-quote"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.quote.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Upload a picture (optional)
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setImage(e.target.files[0] || null);
                        if (e.target.files[0]) setStockImageUrl('');
                      }}
                      className="text-sm"
                      data-testid="spotlight-submit-image"
                    />
                    {image && (
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Upload size={12} /> {image.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">or</span>
                    <PexelsImagePicker
                      target="spotlight"
                      onImported={(url) => { setImage(null); setStockImageUrl(url); }}
                    />
                  </div>
                  {stockImageUrl && (
                    <div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                      <img
                        src={stockImageUrl}
                        alt="Stock preview"
                        className="w-14 h-14 rounded object-cover border"
                      />
                      <span>Free Pexels photo selected.</span>
                      <button
                        type="button"
                        onClick={() => setStockImageUrl('')}
                        className="text-gray-400 hover:text-gray-700"
                        aria-label="Remove stock image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    A clear headshot or a photo of your achievement works best. Or pick a free photo from Pexels.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FFD700] text-[#0f1e42] hover:bg-yellow-400 font-bold"
                  data-testid="submit-spotlight-btn"
                >
                  {submitting ? 'Submitting…' : 'Submit My Story'}
                </Button>
                <p className="text-xs text-gray-500">
                  Your submission will be reviewed before appearing on the Spotlight page.
                </p>
              </form>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SpotlightPage;
