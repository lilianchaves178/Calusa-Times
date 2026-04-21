import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Edit, Trash2, Eye, Plus, Star, CheckCircle, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import api, { assetUrl } from '../lib/api';

const CATEGORIES = ['all', 'news', 'arts', 'opinion', 'sports', 'poetry', 'science', 'quick thought'];

const AdminArticlesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // all | pending | published
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('date_desc'); // date_desc | date_asc | views_desc | title_asc

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/articles/admin/all');
      setArticles(res.data);
    } catch {
      toast({ title: 'Failed to load articles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/articles/${id}/approve`);
      setArticles((arr) => arr.map((a) => (a.id === id ? res.data : a)));
      toast({ title: 'Article published' });
    } catch {
      toast({ title: 'Approve failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/articles/${articleId}`);
      setArticles((arr) => arr.filter((a) => a.id !== articleId));
      toast({ title: 'Article deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const toggleFeatured = async (article) => {
    try {
      const res = await api.put(`/articles/${article.id}`, { featured: !article.featured });
      setArticles((arr) => arr.map((a) => (a.id === article.id ? res.data : a)));
      toast({ title: res.data.featured ? 'Marked featured' : 'Removed featured' });
    } catch {
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
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const filtered = useMemo(() => {
    let out = [...articles];
    if (tab === 'pending') out = out.filter((a) => !a.approved);
    if (tab === 'published') out = out.filter((a) => a.approved);
    if (category !== 'all') out = out.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.author?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q),
      );
    }
    out.sort((a, b) => {
      if (sort === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (sort === 'views_desc') return (b.views || 0) - (a.views || 0);
      if (sort === 'title_asc') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
    return out;
  }, [articles, tab, category, search, sort]);

  const pendingCount = articles.filter((a) => !a.approved).length;

  const tabs = [
    { key: 'all', label: `All (${articles.length})` },
    { key: 'pending', label: `Pending (${pendingCount})` },
    { key: 'published', label: `Published (${articles.length - pendingCount})` },
  ];

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
          <p className="text-blue-200 text-sm">Moderate, edit, and manage all articles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant={tab === t.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTab(t.key)}
                data-testid={`tab-${t.key}`}
                className={tab === t.key ? 'bg-blue-700 hover:bg-blue-800' : ''}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate('/admin/articles/new')}
            data-testid="create-article-btn"
          >
            <Plus size={18} className="mr-2" />
            Create New Article
          </Button>
        </div>

        {/* Search + filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search title, author, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="articles-search-input"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              data-testid="articles-category-filter"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All categories' : c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              data-testid="articles-sort"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="views_desc">Most viewed</option>
              <option value="title_asc">Title A–Z</option>
            </select>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading articles…</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No articles match</h3>
            <p className="text-gray-600 mb-4">
              Try clearing filters, or create a new article.
            </p>
            <Button onClick={() => navigate('/admin/articles/new')} data-testid="empty-create-btn">
              <Plus size={18} className="mr-2" />
              Create Article
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((article) => (
              <Card
                key={article.id}
                className={`p-6 hover:shadow-lg transition-shadow ${
                  !article.approved ? 'border-l-4 border-yellow-400' : ''
                }`}
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                        {article.category}
                      </span>
                      {article.approved ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          PUBLISHED
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                          PENDING
                        </span>
                      )}
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
                    {!article.approved && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(article.id)}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`approve-article-${article.id}`}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Approve
                      </Button>
                    )}
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
