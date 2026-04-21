import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminCommentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comments, setComments] = useState([
    { id: '1', article_title: 'Kickball Champions!', author_name: 'Parent123', content: 'Great game! So proud of the team!', approved: false, created_at: '2 hours ago' },
    { id: '2', article_title: 'Science Fair Winners', author_name: 'Teacher Sarah', content: 'Amazing work students!', approved: false, created_at: '5 hours ago' },
    { id: '3', article_title: 'Art Show Preview', author_name: 'Mom', content: 'Can\'t wait to see the show!', approved: true, created_at: '1 day ago' }
  ]);

  const handleApprove = (id) => {
    setComments(comments.map(c => c.id === id ? {...c, approved: true} : c));
    toast({ title: "Comment Approved", description: "The comment is now visible to everyone." });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this comment?')) {
      setComments(comments.filter(c => c.id !== id));
      toast({ title: "Comment Deleted" });
    }
  };

  const pending = comments.filter(c => !c.approved);
  const approved = comments.filter(c => c.approved);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="text-white border-white hover:bg-green-800 mb-4">
            <ArrowLeft size={18} className="mr-2" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Comments Management</h1>
          <p className="text-green-200 text-sm">Approve and moderate user comments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Approval ({pending.length})</h2>
          {pending.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No pending comments</Card>
          ) : (
            <div className="space-y-4">
              {pending.map(comment => (
                <Card key={comment.id} className="p-6 border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-yellow-600" />
                        <span className="text-sm font-semibold text-gray-900">{comment.article_title}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <p className="text-sm text-gray-500">By {comment.author_name} • {comment.created_at}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(comment.id)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle size={16} className="mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(comment.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Approved Comments ({approved.length})</h2>
          <div className="space-y-4">
            {approved.map(comment => (
              <Card key={comment.id} className="p-6 border-l-4 border-green-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">{comment.article_title}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <p className="text-sm text-gray-500">By {comment.author_name} • {comment.created_at}</p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(comment.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommentsPage;