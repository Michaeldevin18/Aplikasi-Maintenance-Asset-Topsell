
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  History, 
  Scan, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { TopsellLogo } from './Logo';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Scan Asset', href: '/scan', icon: Scan },
    { name: 'History', href: '/history', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto border-r border-gray-100",
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-24 px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 text-brand-red">
               <TopsellLogo className="h-full w-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-brand-red leading-none tracking-wide">TOPSELL</span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-1">Asset Management</span>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive 
                    ? 'bg-brand-red/10 text-brand-red shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={clsx(
                    "h-5 w-5 transition-colors",
                    isActive ? 'text-brand-red' : 'text-gray-400 group-hover:text-gray-600'
                  )} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-brand-red" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center mb-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-brand-red flex items-center justify-center text-white shadow-md">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">Technician</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm h-16 flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4 flex items-center gap-2">
            <div className="h-8 w-8 text-brand-red">
               <TopsellLogo className="h-full w-full" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Topsell Asset'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
