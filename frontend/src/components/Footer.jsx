import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Edit, Shield, Newspaper, Mail, Check } from 'lucide-react';
import api from '../lib/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/subscribers', { email, source: 'footer' });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setError(err?.response?.data?.detail?.[0]?.msg || 'Please check your email address.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0f1e42] text-white mt-12 print:hidden">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Row 1 — Brand + Social (two columns on md+, stacked on mobile) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <img
              src="/branding/calusa-logo.jpg"
              alt="Calusa Elementary — A Step Ahead"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-400/60"
              data-testid="footer-calusa-logo"
            />
            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg leading-tight">The Calusa Times</h3>
              <p className="text-xs text-gray-300">Calusa Elementary School</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Made with <span className="text-red-400">♥</span> by Calusa Students
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-end">
            <a
              href="https://www.instagram.com/calusaelemschool/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Calusa Elementary on Instagram"
              data-testid="footer-instagram-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-white bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:scale-105 shadow-lg transition-transform whitespace-nowrap"
            >
              <Instagram size={16} />
              Follow us
            </a>
            <a
              href="https://www.calusaschool.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              data-testid="footer-school-website-link"
            >
              Visit School Website
            </a>
          </div>
        </div>

        {/* Row 2 — Primary CTAs. Full width, wraps cleanly. */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/print"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-[#0f1e42] bg-[#FFD700] hover:bg-yellow-400 shadow-md transition-colors whitespace-nowrap"
            data-testid="footer-monthly-newspaper-btn"
          >
            <Newspaper size={16} />
            This Month's Newspaper
          </Link>
          <Link
            to="/submit-story"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-[#0f1e42] bg-white hover:bg-gray-100 shadow-md transition-colors whitespace-nowrap"
            data-testid="footer-submit-btn"
          >
            <Edit size={16} />
            Submit a Story
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white border border-white/40 hover:bg-white/10 transition-colors whitespace-nowrap"
            data-testid="footer-admin-btn"
          >
            <Shield size={16} />
            Admin
          </Link>
        </div>

        {/* Row 3 — Newsletter signup. Centered, generous width. */}
        <div className="mt-5 flex flex-col items-center gap-2">
          {subscribed ? (
            <div
              className="inline-flex items-center gap-2 text-sm text-[#FFD700] bg-white/5 border border-white/15 rounded-full px-5 py-2.5"
              data-testid="footer-subscribed"
            >
              <Check size={16} />
              Thanks! You&apos;ll get an email when the next issue drops.
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="w-full max-w-md flex items-stretch gap-2 bg-white/5 border border-white/15 rounded-full pl-4 pr-1 py-1"
              data-testid="footer-subscribe-form"
            >
              <Mail size={16} className="self-center text-yellow-300 flex-shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Remind me when the new issue is out"
                className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none min-w-0"
                data-testid="footer-subscribe-input"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#FFD700] text-[#0f1e42] text-xs font-bold px-4 hover:bg-yellow-400 disabled:opacity-60 whitespace-nowrap"
                data-testid="footer-subscribe-btn"
              >
                {submitting ? '…' : 'Notify me'}
              </button>
            </form>
          )}
          {error && (
            <p className="text-xs text-red-300" data-testid="footer-subscribe-error">{error}</p>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} The Calusa Times · Student-powered since 2019
        </div>
      </div>
    </footer>
  );
};

export default Footer;
