import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Logo } from '../common/Logo';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Us' },
  { to: '/food-safety', label: 'Food Safety' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { currentUser, demoMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const portalPath =
    currentUser?.role === 'PROVIDER'
      ? '/provider/dashboard'
      : currentUser?.role === 'NGO'
      ? '/ngo/dashboard'
      : currentUser?.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9] text-[#1C2520]">
      <header className="sticky top-0 z-40 border-b border-[#E2E8E4] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link to="/" aria-label="FoodRescue Home" className="shrink-0">
            <Logo />
          </Link>

          {/* Zone 2: Concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A5950]">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#14532D] ${
                    active ? 'text-[#14532D] underline underline-offset-8 decoration-2' : ''
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {currentUser ? (
              <Link
                to={portalPath}
                className="inline-flex items-center rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F4022] transition-colors whitespace-nowrap shrink-0"
              >
                Open Portal
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#1C2520] hover:text-[#14532D] transition-colors whitespace-nowrap shrink-0"
                >
                  Login
                </Link>
                <Link
                  to="/register/provider"
                  className="inline-flex items-center rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F4022] transition-colors whitespace-nowrap shrink-0"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden rounded-lg p-2 text-[#1C2520] hover:bg-[#F2F6F3]"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E2E8E4] bg-white px-4 py-4 space-y-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === item.to
                    ? 'bg-[#F2F6F3] text-[#14532D]'
                    : 'text-[#4A5950] hover:bg-[#F2F6F3]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-[#E2E8E4] flex items-center gap-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm font-medium text-[#1C2520]"
              >
                Login
              </Link>
              <Link
                to="/register/provider"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#E2E8E4] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2 space-y-3">
              <Logo />
              <p className="text-sm text-[#4A5950] max-w-md leading-relaxed">
                Predict Surplus. Rescue Food. Feed Communities. Connecting commercial kitchens,
                hostels, and bakeries with verified NGOs through statistical forecasting and
                multi-recipient allocation.
              </p>
              <p className="text-xs text-[#4A5950]">
                {demoMode
                  ? 'Mode: DEMO MODE (Sample records displayed; switch to live Spring Boot API via environment configuration).'
                  : 'Mode: Connected to Spring Boot REST API.'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1C2520] mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-[#4A5950]">
                <li>
                  <Link to="/how-it-works" className="hover:text-[#14532D]">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#14532D]">
                    About Us & SDGs
                  </Link>
                </li>
                <li>
                  <Link to="/food-safety" className="hover:text-[#14532D]">
                    Food Safety Protocol
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#14532D]">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1C2520] mb-3">Portals</h3>
              <ul className="space-y-2 text-sm text-[#4A5950]">
                <li>
                  <Link to="/register/provider" className="hover:text-[#14532D]">
                    Register as Food Provider
                  </Link>
                </li>
                <li>
                  <Link to="/register/ngo" className="hover:text-[#14532D]">
                    Register as NGO
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#14532D]">
                    Portal Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/verify-account" className="hover:text-[#14532D]">
                    Verify Email / Phone OTP
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-[#E2E8E4] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A5950]">
            <p>© {new Date().getFullYear()} FoodRescue Platform. Smart Food. Shared Hope.</p>
            <p>Architecture: React + TypeScript · Java Spring Boot 3 · MySQL (foodrescue_db)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
