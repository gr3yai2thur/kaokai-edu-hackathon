import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Menu, X, GraduationCap, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import AiChat from './AiChat';

const allNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 shadow-sm fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">LearnHub</p>
            <p className="text-xs text-slate-400">Analytics Platform</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-violet-50 text-violet-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <Icon className={cn('w-4 h-4', active ? 'text-violet-600' : '')} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-slate-100 space-y-3">
          {user && (
            <div className="px-2">
              <p className="text-xs font-medium text-slate-700 truncate">{user.displayName || user.email}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 flex items-center justify-between px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm">LearnHub</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="bg-white w-64 h-full shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1 mt-4">
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                      active ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all mt-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="pt-14 md:pt-0">
          <Outlet />
        </div>
      </main>
      <AiChat />
    </div>
  );
}