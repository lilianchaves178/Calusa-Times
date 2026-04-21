import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Eye, MousePointer } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Page Views', value: '12,453', change: '+12%', icon: Eye, color: 'text-blue-600' },
    { label: 'Total Articles', value: '47', change: '+5', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Total Clicks', value: '3,241', change: '+8%', icon: MousePointer, color: 'text-purple-600' },
    { label: 'Avg. Time on Site', value: '3:45', change: '+15s', icon: BarChart3, color: 'text-orange-600' }
  ];

  const topArticles = [
    { title: 'Calusa Earns Platinum STEM Designation', views: 1245, clicks: 342 },
    { title: 'Kickball Champions!', views: 987, clicks: 234 },
    { title: 'Spring Art Show Preview', views: 876, clicks: 198 }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="text-white border-white hover:bg-indigo-800 mb-4">
            <ArrowLeft size={18} className="mr-2" />Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-indigo-200 text-sm">View website statistics and insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={stat.color} size={24} />
                  <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Top Performing Articles</h2>
          <div className="space-y-4">
            {topArticles.map((article, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold">{article.title}</h3>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {article.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointer size={14} />
                    {article.clicks} clicks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;