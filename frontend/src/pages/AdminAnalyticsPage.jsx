import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Eye, MousePointer } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import api from '../lib/api';

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/articles')
      .then((res) => setArticles(res.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalClicks = articles.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  const stats = [
    { label: 'Total Articles', value: articles.length, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Total Article Views', value: totalViews, icon: Eye, color: 'text-blue-600' },
    { label: 'Total Clicks', value: totalClicks, icon: MousePointer, color: 'text-purple-600' },
    { label: 'Click-through Rate', value: `${ctr}%`, icon: BarChart3, color: 'text-orange-600' },
  ];

  const topArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-indigo-800 mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-indigo-200 text-sm">View website statistics and insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-gray-600">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6" data-testid={`stat-${stat.label}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={stat.color} size={24} />
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </Card>
                );
              })}
            </div>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Top Performing Articles</h2>
              {topArticles.length === 0 ? (
                <p className="text-gray-500">No articles yet.</p>
              ) : (
                <div className="space-y-4">
                  {topArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      data-testid={`top-article-${article.id}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate">{article.title}</h3>
                          <p className="text-xs text-gray-500">By {article.author}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm flex-shrink-0 ml-4">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {article.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer size={14} />
                          {article.clicks || 0} clicks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
