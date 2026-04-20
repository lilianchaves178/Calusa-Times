import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Users, Trophy, Info, Edit } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0f1e42] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-[#0f1e42] font-bold text-xl">The Calusa Times</h1>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Student Newspaper</p>
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#FFD700] text-[#0f1e42]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Button className="bg-[#FFD700] text-[#0f1e42] hover:bg-[#FFC700] font-semibold">
            <Edit size={18} className="mr-2" />
            Editor
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
