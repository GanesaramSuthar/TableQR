import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/owner/menu', label: 'Menu', icon: '🍽️' },
  { path: '/owner/menu/import', label: 'Import Menu', icon: '📷' },
  { path: '/owner/tables', label: 'Tables', icon: '🪑' },
  { path: '/owner/orders', label: 'Orders', icon: '📋' },
];

export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-green transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-green-light/30">
            <Link to="/owner/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-xl font-bold text-white">TableQR</span>
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <span className="text-lg">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-green-light/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-orange flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0) || 'O'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/60 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/owner/login'); }} className="w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">Sign Out</button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-cream-dark/50 px-4 lg:px-8 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-cream-dark">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-semibold text-charcoal">{navItems.find(i => i.path === location.pathname)?.label || 'Owner Dashboard'}</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
