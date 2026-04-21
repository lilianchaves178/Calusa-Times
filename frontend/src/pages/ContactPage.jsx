import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const emptyForm = { name: '', email: '', subject: '', message: '', article_id: '' };

const ContactPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [articles, setArticles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api
      .get('/articles', { params: { approved_only: true } })
      .then((res) => setArticles(res.data || []))
      .catch(() => setArticles([]));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        article_id: form.article_id || undefined,
      });
      toast({
        title: 'Message sent',
        description: "Thanks for reaching out — we'll get back to you shortly.",
      });
      setForm(emptyForm);
      setSent(true);
    } catch (err) {
      toast({
        title: 'Could not send',
        description: err?.response?.data?.detail?.[0]?.msg || err?.response?.data?.detail || 'Please check your entries and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail size={32} className="text-[#0f1e42]" />
            <h1 className="text-4xl font-black text-[#0f1e42]">Contact Us</h1>
          </div>
          <p className="text-gray-600">
            Spotted a typo in an article, have a suggestion, or just want to say hi? Drop us a note — a real editor will read it.
          </p>
        </div>

        {sent ? (
          <Card className="p-10 text-center bg-[#FFF8E7] border-[#FFD700]" data-testid="contact-sent-card">
            <CheckCircle size={48} className="mx-auto mb-3 text-emerald-600" />
            <h2 className="text-2xl font-bold text-[#0f1e42] mb-2">Thanks — we got it!</h2>
            <p className="text-gray-700 mb-6">
              An editor will review your message and reach back out at <strong>{form.email || 'the email you provided'}</strong> if a reply is needed.
            </p>
            <Button
              onClick={() => setSent(false)}
              variant="outline"
              data-testid="contact-send-another-btn"
            >
              Send another message
            </Button>
          </Card>
        ) : (
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1">Your name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="First & last"
                    required
                    data-testid="contact-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@example.com"
                    required
                    data-testid="contact-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <Input
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                  placeholder="What's this about?"
                  required
                  data-testid="contact-subject-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Related article <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.article_id}
                  onChange={(e) => update('article_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  data-testid="contact-article-select"
                >
                  <option value="">— Not about a specific article —</option>
                  {articles.slice(0, 50).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Message</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={6}
                  placeholder="Tell us what's on your mind…"
                  required
                  data-testid="contact-message-input"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#0f1e42] text-white hover:bg-[#1a2d5a] gap-2 w-full md:w-auto"
                data-testid="contact-submit-btn"
              >
                <Send size={16} />
                {submitting ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
