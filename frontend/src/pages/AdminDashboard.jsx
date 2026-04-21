import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Newspaper, MessageSquare, Users, 
  Palette, Sparkles, MessageCircle, Megaphone, LogOut,
  BarChart3, Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/admin');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

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
      count: '12 articles'
    },
    {
      title: 'Comments',
      icon: MessageSquare,
      description: 'Approve and moderate comments',
      color: 'bg-green-500',
      link: '/admin/comments',
      count: '5 pending'
    },
    {
      title: 'User Management',
      icon: Users,
      description: 'Manage users and permissions',
      color: 'bg-purple-500',
      link: '/admin/users',
      count: '8 users'
    },
    {
      title: 'Art Submissions',
      icon: Palette,
      description: 'Review and approve student art',
      color: 'bg-pink-500',
      link: '/admin/art',
      count: '3 pending'
    },
    {
      title: 'Sponsors',
      icon: Sparkles,
      description: 'Manage sponsor listings',
      color: 'bg-yellow-500',
      link: '/admin/sponsors',
      count: '6 sponsors'
    },
    {
      title: 'Mural Messages',
      icon: MessageCircle,
      description: 'Approve community mural posts',
      color: 'bg-orange-500',
      link: '/admin/mural',
      count: '2 pending'
    },
    {
      title: 'Popups',
      icon: Megaphone,
      description: 'Create announcement popups',
      color: 'bg-red-500',
      link: '/admin/popups',
      count: '1 active'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      description: 'View website statistics',
      color: 'bg-indigo-500',
      link: '/admin/analytics',
      count: 'View stats'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name}! 👋
          </h2>
          <p className="text-gray-600">
            Manage all aspects of The Calusa Times from this dashboard. Select a section below to get started.
          </p>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <Link to="/submit-story">
              <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500">
                <Newspaper size={18} className="mr-2" />
                Create Article
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">
                View Website
              </Button>
            </Link>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} to={section.link}>
                <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-blue-500">
                  <div className={`${section.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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

        {/* Recent Activity */}
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-700">New article submitted: "Science Fair Winners"</p>
              <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-700">Comment awaiting approval on "Kickball Champions"</p>
              <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-gray-700">New art submission from Emma Rodriguez</p>
              <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;