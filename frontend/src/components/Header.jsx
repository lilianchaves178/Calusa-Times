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
    <header className="bg-white border-b-2 border-[#0f1e42] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0f1e42] flex items-center justify-center border-2 border-[#0f1e42]">
              <span className="text-white font-bold text-lg" style={{fontFamily: 'Georgia, serif'}}>C</span>
            </div>
            <div>
              <h1 className="text-[#0f1e42] font-bold text-lg" style={{fontFamily: 'Georgia, serif'}}>The Calusa Times</h1>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest" style={{fontFamily: 'Georgia, serif'}}>Student Newspaper</p>
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
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? 'border-[#0f1e42] text-[#0f1e42]'
                      : 'border-transparent text-gray-600 hover:text-[#0f1e42]'
                  }`}
                  style={{fontFamily: 'Georgia, serif'}}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Button className="bg-[#0f1e42] text-white hover:bg-[#1a2d5a] font-semibold border-2 border-[#0f1e42]" style={{fontFamily: 'Georgia, serif'}}>
            <Edit size={16} className="mr-2" />
            Submit Story
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
