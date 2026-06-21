import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { MoonLoader, OsbaLogo } from '../components/MoonLoader';
import { IbadahDashboard } from './IbadahDashboard';
import { IbadahPendataan } from './IbadahPendataan';
import { IbadahLaporan } from './IbadahLaporan';
import { LayoutDashboard, ClipboardList, FileText, LogOut, Menu, X } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'pendataan', label: 'Pendataan',  Icon: ClipboardList },
  { id: 'laporan',   label: 'Laporan',    Icon: FileText },
];

export function IbadahLayout() {
  const { user, logout } = useAuth();
  const [page, setPage]         = useState('dashboard');
  const [loading, setLoading]   = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  const navigate = (id: string) => {
    if (id === page) return;
    setLoading(true);
    setSideOpen(false);
    setTimeout(() => {
      setPage(id);
      setLoading(false);
    }, 700);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <IbadahDashboard />;
      case 'pendataan': return <IbadahPendataan />;
      case 'laporan':   return <IbadahLaporan />;
      default:          return <IbadahDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {loading && <MoonLoader title="Qism Ibadah OSBA" subtitle="Berpindah halaman" />}

      {/* Mobile overlay */}
      {sideOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          sideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OsbaLogo size={40} />
              <div>
                <p className="text-sm font-bold text-black leading-tight">Qism Ibadah</p>
                <p className="text-xs text-gray-400">OSBA</p>
              </div>
            </div>
            <button
              onClick={() => setSideOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'K'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="lg:hidden sticky top-0 bg-white border-b border-gray-200 z-30 flex items-center gap-3 px-4 py-4">
          <button onClick={() => setSideOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-black">Qism Ibadah OSBA</span>
        </header>

        <div className="flex-1 p-4 lg:p-8 animate-fadeIn" key={page}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
