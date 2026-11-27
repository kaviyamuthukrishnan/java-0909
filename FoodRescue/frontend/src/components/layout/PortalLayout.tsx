import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  UtensilsCrossed,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { UserRole } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { Logo } from '../common/Logo';
import { StatusBadge } from '../common/StatusBadge';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const ROLE_NAV: Record<UserRole, NavItem[]> = {
  PROVIDER: [
    { to: '/provider/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/provider/inventory', label: 'Food Inventory', icon: <Package className="w-4 h-4" /> },
    { to: '/provider/prediction', label: 'Surplus Prediction', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/provider/donate', label: 'Donate Food', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { to: '/provider/donations', label: 'Donation History', icon: <ClipboardCheck className="w-4 h-4" /> },
    { to: '/portal/tracking', label: 'Lifecycle Tracking', icon: <Activity className="w-4 h-4" /> },
    { to: '/portal/messages', label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
    { to: '/provider/profile', label: 'Profile & Docs', icon: <Building2 className="w-4 h-4" /> },
  ],
  NGO: [
    { to: '/ngo/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/ngo/available', label: 'Available Donations', icon: <HeartHandshake className="w-4 h-4" /> },
    { to: '/ngo/collections', label: 'Pickup & Collections', icon: <Truck className="w-4 h-4" /> },
    { to: '/portal/tracking', label: 'Lifecycle Tracking', icon: <Activity className="w-4 h-4" /> },
    { to: '/portal/messages', label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
    { to: '/ngo/profile', label: 'NGO Profile & Docs', icon: <FileCheck2 className="w-4 h-4" /> },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Overview & Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/verifications', label: 'Verifications', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/admin/monitoring', label: 'Allocation & Monitor', icon: <Activity className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/complaints', label: 'Complaints & Support', icon: <AlertTriangle className="w-4 h-4" /> },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: <FileCheck2 className="w-4 h-4" /> },
    { to: '/portal/tracking', label: 'Lifecycle Tracking', icon: <ClipboardCheck className="w-4 h-4" /> },
  ],
};

export function PortalLayout({
  breadcrumb,
  children,
}: {
  breadcrumb: string;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    demoMode,
    loginDemoRole,
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoDataset,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!currentUser) return null;

  const navItems = ROLE_NAV[currentUser.role];
  const roleNotifs = notifications.filter((n) => n.targetRole === currentUser.role);
  const unreadCount = roleNotifs.filter((n) => !n.isRead).length;

  const handleQuickRoleSwitch = (role: UserRole) => {
    loginDemoRole(role);
    setProfileOpen(false);
    if (role === 'PROVIDER') navigate('/provider/dashboard');
    if (role === 'NGO') navigate('/ngo/dashboard');
    if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-[#FAFBF9] text-[#1C2520]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-[#E2E8E4] bg-white">
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#E2E8E4]">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-[#E2E8E4] bg-[#F7FAF8]">
          <p className="text-xs font-medium text-[#4A5950]">
            {currentUser.role === 'PROVIDER'
              ? 'Food Provider Portal'
              : currentUser.role === 'NGO'
              ? 'NGO Rescue Portal'
              : 'Administrator Portal'}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#1C2520] truncate">
            {currentUser.organizationName || currentUser.name}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#14532D] text-white'
                    : 'text-[#4A5950] hover:bg-[#F2F6F3] hover:text-[#1C2520]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {demoMode && (
          <div className="p-3 border-t border-[#E2E8E4] bg-[#FAFBF9] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#EA580C]">
              <span>DEMO MODE ACTIVE</span>
              <button
                type="button"
                onClick={resetDemoDataset}
                title="Reset demo workflow data"
                className="inline-flex items-center gap-1 text-[#4A5950] hover:text-[#14532D]"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>
            <p className="text-[11px] text-[#4A5950] leading-snug">
              Switch portals to test the 12-step donation workflow:
            </p>
            <div className="grid grid-cols-3 gap-1">
              {(['PROVIDER', 'NGO', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickRoleSwitch(r)}
                  className={`rounded px-1.5 py-1 text-[11px] font-medium border transition-colors ${
                    currentUser.role === r
                      ? 'bg-[#14532D] text-white border-[#14532D]'
                      : 'bg-white text-[#1C2520] border-[#D3DDD6] hover:bg-[#F2F6F3]'
                  }`}
                >
                  {r === 'PROVIDER' ? 'Provider' : r === 'NGO' ? 'NGO' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex w-72 max-w-full flex-col bg-white border-r border-[#E2E8E4]">
            <div className="flex h-16 items-center justify-between px-5 border-b border-[#E2E8E4]">
              <Logo />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[#4A5950]"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      active
                        ? 'bg-[#14532D] text-white'
                        : 'text-[#4A5950] hover:bg-[#F2F6F3]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            {demoMode && (
              <div className="p-4 border-t border-[#E2E8E4] space-y-2">
                <p className="text-xs font-semibold text-[#EA580C]">DEMO PORTAL SWITCHER</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['PROVIDER', 'NGO', 'ADMIN'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        handleQuickRoleSwitch(r);
                        setSidebarOpen(false);
                      }}
                      className={`rounded px-2 py-1.5 text-xs font-medium border ${
                        currentUser.role === r
                          ? 'bg-[#14532D] text-white border-[#14532D]'
                          : 'bg-white text-[#1C2520] border-[#D3DDD6]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Workspace Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#E2E8E4] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-[#1C2520] hover:bg-[#F2F6F3]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-[#4A5950] truncate">
              <span className="hidden sm:inline font-medium text-[#14532D]">
                {currentUser.role}
              </span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-[#1C2520] truncate">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {demoMode && (
              <span className="hidden sm:inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#C2410C] whitespace-nowrap">
                DEMO MODE
              </span>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className="relative rounded-lg border border-[#E2E8E4] p-2 text-[#4A5950] hover:bg-[#F2F6F3] hover:text-[#1C2520] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EA580C] px-1 text-[10px] font-bold text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#E2E8E4] bg-white shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-[#E2E8E4] px-4 py-3">
                    <span className="text-sm font-semibold text-[#1C2520]">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-medium text-[#14532D] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8E4]">
                    {roleNotifs.length === 0 ? (
                      <p className="p-4 text-sm text-[#4A5950] text-center">No notifications.</p>
                    ) : (
                      roleNotifs.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => markNotificationRead(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-[#F7FAF8] transition-colors ${
                            !n.isRead ? 'bg-[#F2F6F3]/60' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#1C2520]">{n.title}</span>
                            {!n.isRead && (
                              <span className="text-[11px] font-medium text-[#EA580C]">New</span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-[#4A5950] leading-relaxed">{n.message}</p>
                          <p className="mt-1 text-[11px] font-mono text-[#64748B]">
                            {formatDateTime(n.createdAt)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((p) => !p);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-lg border border-[#E2E8E4] px-3 py-1.5 text-left hover:bg-[#F2F6F3] transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#14532D] text-xs font-semibold text-white shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-[#1C2520] leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[#4A5950] leading-tight">{currentUser.role}</p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#E2E8E4] bg-white p-3 shadow-xl z-50 space-y-3">
                  <div className="border-b border-[#E2E8E4] pb-2.5">
                    <p className="text-sm font-semibold text-[#1C2520]">{currentUser.name}</p>
                    <p className="text-xs text-[#4A5950] truncate">{currentUser.email}</p>
                    <div className="mt-2">
                      <StatusBadge status={currentUser.verificationStatus} />
                    </div>
                  </div>
                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-[#1C2520] hover:bg-[#F2F6F3]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                    Public Website
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
