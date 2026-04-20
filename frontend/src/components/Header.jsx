import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Users, Trophy, Info, Edit, Shield } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/articles', label: 'Articles', icon: Newspaper },
    { path: '/spotlight', label: 'Spotlight', icon: Users },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/school-info', label: 'School Info', icon: Info }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-yellow-300 font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-blue-800 font-bold text-xl">The Calusa Times</h1>
              <p className="text-xs text-gray-600">Student Newspaper</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/submit-story">
              <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-semibold shadow-md">
                <Edit size={18} className="mr-2" />
                Submit Story
              </Button>
            </Link>
            <Link to="/admin">
              <Button className="bg-blue-900 text-white hover:bg-blue-800 font-semibold shadow-md">
                <Shield size={18} className="mr-2" />
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