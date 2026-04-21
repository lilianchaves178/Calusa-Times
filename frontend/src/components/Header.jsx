import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Users, Trophy, Info, Edit, Shield, Palette, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/articles', label: 'Articles', icon: Newspaper },
    { path: '/mural', label: 'Mural', icon: MessageSquare },
    { path: '/student-art', label: 'Art Gallery', icon: Palette },
    { path: '/sponsors', label: 'Sponsors', icon: Sparkles },
    { path: '/spotlight', label: 'Spotlight', icon: Users },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/school-info', label: 'Info', icon: Info }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/branding/calusa-logo.jpg"
              alt="Calusa Elementary — A Step Ahead"
              className="w-12 h-12 rounded-full object-cover shadow-md ring-1 ring-gray-200"
              data-testid="header-calusa-logo"
            />
            <div>
              <h1 className="text-blue-800 font-bold text-lg">The Calusa Times</h1>
              <p className="text-[10px] text-gray-600">Student Newspaper</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/submit-story">
              <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-semibold shadow-md text-xs py-2 px-3 h-8">
                <Edit size={14} className="mr-1.5" />
                Submit
              </Button>
            </Link>
            <Link to="/admin">
              <Button className="bg-blue-900 text-white hover:bg-blue-800 font-semibold shadow-md text-xs py-2 px-3 h-8">
                <Shield size={14} className="mr-1.5" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;