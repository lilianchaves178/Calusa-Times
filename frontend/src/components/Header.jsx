import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Newspaper,
  Users,
  Trophy,
  Info,
  Edit,
  Shield,
  Palette,
  Sparkles,
  MessageSquare,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/articles', label: 'Articles', icon: Newspaper },
  { path: '/mural', label: 'Mural', icon: MessageSquare },
  { path: '/student-art', label: 'Student Gallery', icon: Palette },
  { path: '/sponsors', label: 'Sponsors', icon: Sparkles },
  { path: '/spotlight', label: 'Spotlight', icon: Users },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/school-info', label: 'Info', icon: Info },
  { path: '/contact', label: 'Contact', icon: Mail },
];

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo + wordmark */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img
              src="/branding/calusa-logo.jpg"
              alt="Calusa Elementary"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md ring-1 ring-gray-200"
              data-testid="header-calusa-logo"
            />
            <div className="min-w-0">
              <h1 className="text-blue-800 font-bold text-base sm:text-lg leading-tight truncate">
                The Calusa Times
              </h1>
              <p className="text-[10px] text-gray-600 hidden sm:block">Student Newspaper</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? 'bg-blue-700 text-white' : 'text-gray-700 hover:bg-blue-50'
                  }`}
                  data-testid={`nav-${item.path}`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link to="/submit-story">
              <Button
                className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-semibold shadow-md text-xs py-2 px-3 h-8"
                data-testid="header-submit-btn"
              >
                <Edit size={14} className="mr-1.5" />
                Submit
              </Button>
            </Link>
            <Link to="/admin">
              <Button
                className="bg-blue-900 text-white hover:bg-blue-800 font-semibold shadow-md text-xs py-2 px-3 h-8"
                data-testid="header-admin-btn"
              >
                <Shield size={14} className="mr-1.5" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile/tablet hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden h-10 w-10 text-blue-900"
                aria-label="Open menu"
                data-testid="mobile-menu-btn"
              >
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm p-0 flex flex-col"
              data-testid="mobile-menu-drawer"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b bg-blue-900 text-white">
                <div className="flex items-center gap-2">
                  <img
                    src="/branding/calusa-logo.jpg"
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-yellow-400/60"
                  />
                  <div>
                    <p className="font-bold leading-tight">The Calusa Times</p>
                    <p className="text-[10px] text-blue-200">Student Newspaper</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="text-white/80 hover:text-white"
                  aria-label="Close menu"
                  data-testid="mobile-menu-close"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-5 py-3 text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      data-testid={`mobile-nav-${item.path}`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-5 py-4 border-t bg-gray-50 flex flex-col gap-2">
                <Link to="/submit-story" onClick={() => setMobileOpen(false)}>
                  <Button
                    className="w-full bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-semibold h-11"
                    data-testid="mobile-submit-btn"
                  >
                    <Edit size={16} className="mr-2" />
                    Submit a Story
                  </Button>
                </Link>
                <Link to="/admin" onClick={() => setMobileOpen(false)}>
                  <Button
                    className="w-full bg-blue-900 text-white hover:bg-blue-800 font-semibold h-11"
                    data-testid="mobile-admin-btn"
                  >
                    <Shield size={16} className="mr-2" />
                    Admin
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
