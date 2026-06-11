import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, BarChart3, Bell, User, LogOut, Zap, Search } from 'lucide-react';
import { useAuthStore } from '../../context/authStore';
import { useSocket } from '../../context/SocketContext';
import { useQuery } from '@tanstack/react-query';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll().then((r) => r.data),
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Feed', end: true },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: `/profile/${user?.username}`, icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-slate-800 bg-slate-900/50 p-4 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">SocialHub</span>
          <div className={`ml-auto w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <div className="relative">
                <Icon size={20} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-800 pt-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
              {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{user?.displayName || user?.username}</p>
              <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={18} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
