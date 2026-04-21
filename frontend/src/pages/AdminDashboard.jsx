import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  MessageSquare,
  Users,
  Palette,
  Sparkles,
  MessageCircle,
  Megaphone,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import api from '../lib/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({
    articles: '—',
    pendingComments: '—',
    users: '—',
    pendingArt: '—',
    sponsors: '—',
    pendingMural: '—',
    activePopups: '—',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const loadCounts = async () => {
      const safe = async (fn) => {
        try {
          return await fn();
        } catch {
          return null;
        }
      };
      const [articles, pendingComments, users, pendingArt, sponsors, pendingMural, popups] =
        await Promise.all([
          safe(() => api.get('/articles')),
          safe(() => api.get('/comments/pending/all')),
          safe(() => api.get('/auth/users')),
          safe(() => api.get('/art/pending')),
          safe(() => api.get('/sponsors', { params: { active_only: false } })),
          safe(() => api.get('/mural/pending')),
          safe(() => api.get('/popups')),
        ]);

      setCounts({
        articles: articles?.data?.length ?? '—',
        pendingComments: pendingComments?.data?.length ?? '—',
        users: users?.data?.length ?? '—',
        pendingArt: pendingArt?.data?.length ?? '—',
        sponsors: sponsors?.data?.length ?? '—',
        pendingMural: pendingMural?.data?.length ?? '—',
        activePopups: popups?.data?.length ?? '—',
      });
    };
    loadCounts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  if (!user) return null;

  const adminSections = [
    {
      title: 'Articles Management',
      icon: Newspaper,
      description: 'Create, edit, and manage articles',
      color: 'bg-blue-500',
      link: '/admin/articles',
      count: `${counts.articles} articles`,
      testId: 'section-articles',
    },
    {
      title: 'Comments',
      icon: MessageSquare,
      description: 'Approve and moderate comments',
      color: 'bg-green-500',
      link: '/admin/comments',
      count: `${counts.pendingComments} pending`,
      testId: 'section-comments',
    },
    {
      title: 'User Management',
      icon: Users,
      description: 'Manage users and permissions',
      color: 'bg-purple-500',
      link: '/admin/users',
      count: `${counts.users} users`,
      testId: 'section-users',
    },
    {
      title: 'Art Submissions',
      icon: Palette,
      description: 'Review and approve student art',
      color: 'bg-pink-500',
      link: '/admin/art',
      count: `${counts.pendingArt} pending`,
      testId: 'section-art',
    },
    {
      title: 'Sponsors',
      icon: Sparkles,
      description: 'Manage sponsor listings',
      color: 'bg-yellow-500',
      link: '/admin/sponsors',
      count: `${counts.sponsors} sponsors`,
      testId: 'section-sponsors',
    },
    {
      title: 'Mural Messages',
      icon: MessageCircle,
      description: 'Verify payment & approve posts',
      color: 'bg-orange-500',
      link: '/admin/mural',
      count: `${counts.pendingMural} pending`,
      testId: 'section-mural',
    },
    {
      title: 'Popups',
      icon: Megaphone,
      description: 'Create announcement popups',
      color: 'bg-red-500',
      link: '/admin/popups',
      count: `${counts.activePopups} active`,
      testId: 'section-popups',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      description: 'View website statistics',
      color: 'bg-indigo-500',
      link: '/admin/analytics',
      count: 'View stats',
      testId: 'section-analytics',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard size={32} />
              <div>
                <h1 className="text-2xl font-bold">The Calusa Times - Admin</h1>
                <p className="text-sm text-blue-200">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-xs text-blue-200 capitalize">{user.role}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-white border-white hover:bg-blue-800"
                data-testid="logout-btn"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name}!
          </h2>
          <p className="text-gray-600">
            Manage all aspects of The Calusa Times from this dashboard.
          </p>
        </Card>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex gap-4 flex-wrap">
            <Link to="/admin/articles/new">
              <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500" data-testid="quick-new-article">
                <Newspaper size={18} className="mr-2" />
                New Article
              </Button>
            </Link>
            <Link to="/admin/popups/new">
              <Button variant="outline" data-testid="quick-new-popup">
                <Megaphone size={18} className="mr-2" />
                New Popup
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" data-testid="view-website-btn">
                View Website
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} to={section.link} data-testid={section.testId}>
                <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-blue-500">
                  <div
                    className={`${section.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  <div className="text-xs font-semibold text-blue-600">{section.count}</div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
