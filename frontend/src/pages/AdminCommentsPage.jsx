import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

const AdminCommentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [articleMap, setArticleMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [commentsRes, articlesRes] = await Promise.all([
        api.get('/comments/pending/all'),
        api.get('/articles'),
      ]);
      setPending(commentsRes.data);
      const map = {};
      articlesRes.data.forEach((a) => {
        map[a.id] = a.title;
      });
      setArticleMap(map);
    } catch (e) {
      toast({ title: 'Failed to load comments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/comments/${id}/approve`);
      setPending((arr) => arr.filter((c) => c.id !== id));
      toast({ title: 'Comment approved' });
    } catch (e) {
      toast({ title: 'Approve failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${id}`);
      setPending((arr) => arr.filter((c) => c.id !== id));
      toast({ title: 'Comment deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-green-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Comments Management</h1>
          <p className="text-green-200 text-sm">Approve and moderate user comments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-4" data-testid="pending-count">
          Pending Approval ({pending.length})
        </h2>
        {loading ? (
          <div className="text-gray-600 text-center py-12">Loading…</div>
        ) : pending.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">No pending comments</Card>
        ) : (
          <div className="space-y-4">
            {pending.map((comment) => (
              <Card
                key={comment.id}
                className="p-6 border-l-4 border-yellow-400"
                data-testid={`comment-row-${comment.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-yellow-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {articleMap[comment.article_id] || comment.article_id}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <p className="text-sm text-gray-500">
                      By {comment.author_name} ·{' '}
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(comment.id)}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`approve-comment-${comment.id}`}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(comment.id)}
                      data-testid={`delete-comment-${comment.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommentsPage;
