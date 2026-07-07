import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { useAppContext } from '../../store';
import {
  LayoutDashboard,
  FileText,
  Activity,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Shield,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';

export function AppLayout() {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Protected route check
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resolutions', href: '/resolutions', icon: FileText },
    ...(currentUser.role === 'System Administrator' || currentUser.role === 'ICT Officer' || currentUser.role === 'Clerk Assistant'
      ? [{ name: 'System Settings', href: '/settings', icon: Settings }] 
      : []),
    ...(currentUser.role === 'System Administrator' || currentUser.role === 'ICT Officer' 
      ? [{ name: 'Audit Logs', href: '/audit-logs', icon: Activity }] 
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 bg-orange-600 shadow-xl flex flex-col text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-orange-500/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-orange-600 shadow-inner">
              TT
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight uppercase tracking-wider">Taita Taveta</h1>
              <p className="text-orange-100 text-xs opacity-80">Resolution Tracker</p>
            </div>
          </div>
          <button className="md:hidden text-orange-200 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-4">
          <div className="px-6 mb-2 text-[10px] uppercase font-semibold text-orange-200 tracking-widest">Main Menu</div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-3 transition-colors",
                    isActive 
                      ? "bg-white/10 text-white border-l-4 border-yellow-400 font-medium" 
                      : "text-orange-100 hover:bg-white/5 border-l-4 border-transparent"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-orange-500/50">
          <div className="bg-orange-700/40 rounded-xl p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white/20">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{currentUser.name}</p>
                <p className="text-orange-200 text-[10px] truncate uppercase">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium text-orange-200 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center w-full max-w-xl">
            <button
              className="md:hidden text-slate-500 hover:text-slate-700 focus:outline-none mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input 
                type="text" 
                placeholder="Search by Resolution # (e.g. TTCA/CS/7/VOL.8/(001))" 
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 ml-4">
            <div className="relative">
              <button 
                className="text-slate-500 hover:text-slate-700 focus:outline-none relative p-1"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</div>
                <Bell className="w-6 h-6" />
              </button>
              
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-900 font-medium">Notifications</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-800 font-medium">New Resolution Registered</p>
                      <p className="text-xs text-gray-500 mt-1">TTCA/CS/7/VOL.8/(002) requires your approval.</p>
                      <p className="text-xs text-orange-600 mt-1">10 minutes ago</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 text-center border-t border-gray-100">
                    <a href="#" className="text-xs font-medium text-orange-600 hover:text-orange-500">View all notifications</a>
                  </div>
                </div>
              )}
            </div>
            {/* Download Report / New Resolution buttons would ideally go here if we had them in AppLayout instead of specific pages */}
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
