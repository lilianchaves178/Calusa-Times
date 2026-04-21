import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Edit, Trash2, Eye, Plus, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const AdminArticlesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/articles');
      setArticles(res.data);
    } catch (e) {
      toast({ title: 'Failed to load articles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/articles/${articleId}`);
      setArticles((arr) => arr.filter((a) => a.id !== articleId));
      toast({ title: 'Article deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const toggleFeatured = async (article) => {
    try {
      const res = await api.put(`/articles/${article.id}`, { featured: !article.featured });
      setArticles((arr) => arr.map((a) => (a.id === article.id ? res.data : a)));
      toast({ title: res.data.featured ? 'Marked featured' : 'Removed featured' });
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const toggleComments = async (article) => {
    try {
      const res = await api.put(`/articles/${article.id}`, {
        comments_enabled: !article.comments_enabled,
      });
      setArticles((arr) => arr.map((a) => (a.id === article.id ? res.data : a)));
      toast({ title: res.data.comments_enabled ? 'Comments enabled' : 'Comments disabled' });
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-blue-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Articles Management</h1>
          <p className="text-blue-200 text-sm">Create, edit, and manage all articles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold" data-testid="articles-count">
            All Articles ({articles.length})
          </h2>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate('/admin/articles/new')}
            data-testid="create-article-btn"
          >
            <Plus size={18} className="mr-2" />
            Create New Article
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading articles…</div>
        ) : articles.length === 0 ? (
          <Card className="p-12 text-center">
            <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No articles yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first article!</p>
            <Button onClick={() => navigate('/admin/articles/new')} data-testid="empty-create-btn">
              <Plus size={18} className="mr-2" />
              Create Article
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="p-6 hover:shadow-lg transition-shadow"
                data-testid={`article-row-${article.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {article.image_url && (
                    <img
                      src={assetUrl(article.image_url)}
                      alt=""
                      className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                        {article.category}
                      </span>
                      {article.featured && (
                        <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          <Star size={10} className="inline mr-1" />
                          FEATURED
                        </span>
                      )}
                      {!article.comments_enabled && (
                        <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                          COMMENTS OFF
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span>By {article.author}</span>
                      {article.grade && <span>· {article.grade}</span>}
                      <span>· {new Date(article.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {article.views || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                      className="hover:bg-blue-50"
                      data-testid={`edit-article-${article.id}`}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toggleFeatured(article)}
                      className={
                        article.featured
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-gray-500 hover:bg-gray-600'
                      }
                      data-testid={`feature-article-${article.id}`}
                    >
                      {article.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleComments(article)}
                      data-testid={`toggle-comments-${article.id}`}
                    >
                      {article.comments_enabled ? 'Disable' : 'Enable'} Comments
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                      data-testid={`delete-article-${article.id}`}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
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

export default AdminArticlesPage;
