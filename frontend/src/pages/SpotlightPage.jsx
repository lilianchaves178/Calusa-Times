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

const emptyForm = { name: '', grade: '', quote: '' };

const SpotlightPage = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
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
      const res = await api.post('/spotlight/submit', form);
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
                className="bg-[#0f1e42] rounded-2xl p-8 text-white relative overflow-hidden"
                data-testid={`spotlight-${student.id}`}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#1a2d5a] rounded-full opacity-30 -translate-y-10 translate-x-10"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-1">
                      <div className="w-full h-full rounded-full bg-[#0f1e42] flex items-center justify-center overflow-hidden">
                        {student.image_url ? (
                          <img
                            src={assetUrl(student.image_url)}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-black text-[#FFD700]">
                            {student.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black mb-1">{student.name}</h3>
                    {student.grade && (
                      <p className="text-gray-300 text-sm mb-4">{student.grade}</p>
                    )}
                    <Quote className="text-[#FFD700] mx-auto mb-2" size={20} />
                    <blockquote className="italic text-gray-200 text-sm leading-relaxed">
                      "{student.quote}"
                    </blockquote>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0] || null)}
                      className="text-sm"
                      data-testid="spotlight-submit-image"
                    />
                    {image && (
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Upload size={12} /> {image.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    A clear headshot or a photo of your achievement works best.
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
