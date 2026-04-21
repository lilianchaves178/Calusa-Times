import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Edit, ArrowLeft, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const ArticleGallery = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;
  const n = images.length;
  const prev = () => setIdx((i) => (i - 1 + n) % n);
  const next = () => setIdx((i) => (i + 1) % n);

  return (
    <div className="mb-6" data-testid="article-gallery">
      <div className="relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={assetUrl(images[idx])}
          alt={`Slide ${idx + 1}`}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          data-testid={`article-slide-${idx}`}
        />
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              data-testid="article-gallery-prev"
            >
              <ChevronLeft size={22} className="text-[#0f1e42]" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              data-testid="article-gallery-next"
            >
              <ChevronRight size={22} className="text-[#0f1e42]" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === idx ? 'bg-[#0f1e42]' : 'bg-white/70 hover:bg-white'
                  }`}
                  data-testid={`article-gallery-dot-${i}`}
                />
              ))}
            </div>
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {idx + 1} / {n}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ArticleDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ author_name: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/articles/${id}`)
      .then((res) => setArticle(res.data))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
    api
      .get(`/comments/${id}`)
      .then((res) => setComments(res.data))
      .catch(() => setComments([]));
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/comments', { article_id: id, ...commentForm });
      toast({
        title: 'Comment submitted',
        description: "Thanks! It'll appear after approval.",
      });
      setCommentForm({ author_name: '', content: '' });
    } catch (err) {
      toast({
        title: 'Failed to submit',
        description: err?.response?.data?.detail || '',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">Loading…</div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FFF8E7]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-[#0f1e42] mb-4">Article Not Found</h1>
          <Link to="/" className="text-[#0f1e42] font-semibold hover:underline">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          to="/articles"
          className="flex items-center gap-2 text-[#0f1e42] font-semibold mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft size={18} />
          Back to Articles
        </Link>

        <article className="bg-white rounded-2xl border-4 border-[#0f1e42] p-8 shadow-lg">
          {(() => {
            const gallery = (article.images && article.images.length
              ? article.images
              : article.image_url
                ? [article.image_url]
                : []);
            return gallery.length ? <ArticleGallery images={gallery} /> : null;
          })()}
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl font-black text-[#0f1e42] mb-6 leading-tight">{article.title}</h1>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b-2 border-gray-200 flex-wrap">
            <div className="flex items-center gap-2">
              <Edit size={16} />
              <span className="font-semibold">{article.author}</span>
              {article.grade && <span>· {article.grade}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(article.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg mb-6 font-semibold">
              {article.description}
            </p>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </article>

        {/* Comments section */}
        <section className="mt-10 bg-white rounded-2xl border-2 border-gray-200 p-8">
          <h2 className="text-2xl font-black text-[#0f1e42] mb-6 flex items-center gap-2">
            <MessageSquare size={24} />
            Comments ({comments.length})
          </h2>

          {!article.comments_enabled ? (
            <p className="text-gray-500">Comments are disabled for this article.</p>
          ) : (
            <>
              <form onSubmit={handleSubmitComment} className="mb-8 space-y-3">
                <Input
                  placeholder="Your name"
                  value={commentForm.author_name}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, author_name: e.target.value })
                  }
                  required
                  data-testid="comment-author-input"
                />
                <Textarea
                  placeholder="Share your thoughts…"
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  rows={3}
                  required
                  data-testid="comment-content-input"
                />
                <Button
                  type="submit"
                  className="bg-[#0f1e42] text-white hover:bg-blue-900"
                  disabled={submitting}
                  data-testid="submit-comment-btn"
                >
                  {submitting ? 'Submitting…' : 'Post Comment'}
                </Button>
                <p className="text-xs text-gray-500">
                  Comments are moderated before appearing publicly.
                </p>
              </form>

              {comments.length === 0 ? (
                <p className="text-gray-500">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="border-l-4 border-blue-300 bg-blue-50 p-4 rounded"
                      data-testid={`comment-${c.id}`}
                    >
                      <p className="font-semibold text-gray-900">{c.author_name}</p>
                      <p className="text-gray-700 mt-1">{c.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
